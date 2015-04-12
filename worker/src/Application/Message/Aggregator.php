<?php
namespace Application\Message;

use Application\Message\Source\DataSourceInterface;
use Application\Message\Source\ValidEntriesFilter;
use Application\Message\Exception\TimeoutException;

/**
 * Message aggregator object.
 * This object provides implementation of cooperative multitasking using coroutines.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class Aggregator
{
    /**
     * Aggregator execution queue
     *
     * @var \SplQueue
     */
    protected $executionQueue;

    /**
     * Object constructor
     */
    public function __construct()
    {
        $this->executionQueue = new \SplQueue();
    }

    /**
     * Returns true till aggregator sources EOF have been reached.
     *
     * @return bool
     */
    public function valid()
    {
        return !$this->executionQueue->isEmpty();
    }

    /**
     * Executes aggregation process.
     *
     * @param int $maxBatchSize
     * @param DataSourceInterface[] $sources
     * @param Storage $storage
     * @param callable $lapCallback
     * @return array
     */
    public function run($maxBatchSize, $sources, Storage $storage, callable $lapCallback = null)
    {
        $counter = 0;
        $countries = $flows = [];
        $timeoutHandler = function (TimeoutException $e) use (&$storage, &$counter, &$countries, &$flows) {
            if ($counter > 0) {
                $this->saveResults($storage, $counter, $countries, $flows);
            }
        };

        // Aggregate only valid entries => wrap all sources by ValidEntriesFilter source.
        $filteredSources = [];
        foreach($sources as $source) {
            $filteredSources[] = new ValidEntriesFilter($source);
        }

        foreach($filteredSources as $source) {
            /** @var DataSourceInterface $source */
            $sourceReader = function() use ($source, $timeoutHandler) {
                yield null; // Make this yield for the first implicit rewind() call
                $counter = 1;
                while($source->valid()) {
                    try {
                        $entry = $source->next();
                    } catch (TimeoutException $e) {
                        call_user_func($timeoutHandler, $e);
                        continue;
                    }
                    if (is_null($entry)) {
                        continue;
                    }
                    $callback = (yield $entry);
                    // There are no any reasons to pass callback here, it is just for demonstration of coroutines
                    if (is_callable($callback)) {
                        call_user_func($callback, $entry, $counter++);
                    }
                }
            };
            $this->executionQueue->enqueue($sourceReader());
        }

        while ($this->valid()) {

            if ($counter >= $maxBatchSize) {
                $this->saveResults($storage, $counter, $countries, $flows);
            }

            /** @var \Generator $coroutine */
            $coroutine = $this->executionQueue->dequeue();
            /** @var Entry $entry */
            $entry = $coroutine->send($lapCallback);

            if (!is_null($entry)) {
                $country =  $entry->getCountry();
                if (isset($countries[$country])) {
                    $countries[$country]++;
                } else {
                    $countries[$country] = 1;
                }

                $flowKey = sprintf('%s:%s', $entry->getSource(), $entry->getTarget());
                if (!isset($flows[$flowKey])) {
                    $flows[$flowKey] = [
                        'source' => $entry->getSource(),
                        'target' => $entry->getTarget(),
                        'from'   => 0,
                        'to'     => 0,
                    ];
                }
                $flows[$flowKey]['from'] += $entry->getFrom();
                $flows[$flowKey]['to'] += $entry->getTo();
                $flows[$flowKey]['rate'] = $flows[$flowKey]['to'] / $flows[$flowKey]['from'];

                $counter++;
            }

            if ($coroutine->valid()) {
                $this->executionQueue->enqueue($coroutine);
            }
        }
    }

    /**
     * Save results in the storage and resets counters.
     *
     * @param Storage $storage
     * @param $counter
     * @param $countries
     * @param $flows
     * @throws \Exception
     */
    protected function saveResults(Storage $storage, &$counter, &$countries, &$flows)
    {
        $result = [
            'messages' => $counter,
            'countries' => $countries,
            'flows' => array_values($flows),
        ];

        try {
            $storage->save($result);
        } catch (\Exception $e) {
            // todo@ Add exception handling
            throw $e;
        }

        $counter = 0;
        $countries = $flows = [];
    }
}
