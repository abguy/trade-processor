<?php
namespace Application\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Helper\Helper;
use Symfony\Component\Stopwatch\Stopwatch;
use Zend\Validator;
use Application\Message;

/**
 * Worker run command implementation.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class RunCommand extends Command
{
    /**
     * Application configuration
     *
     * @var \Application\Configuration $configuration
     */
    protected $configuration;

    /**
     * Message storage
     * @var Message\Storage
     */
    protected $storage;

    /**
     * Command constructor.
     *
     * @param \Application\Configuration $configuration
     */
    public function __construct(\Application\Configuration $configuration)
    {
        parent::__construct();

        $this->configuration = $configuration;
    }

    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('worker:run')
            ->setDescription('Executes worker')
            ->addArgument(
                'file',
                InputArgument::IS_ARRAY,
                'Messages csv file'
            )
            ->setHelp(<<<EOF
The <info>%command.name%</info> command executes worker to process messages from the queue.

For example:
    <comment>php %command.full_name% messages.csv</comment>
    <comment>php %command.full_name% -vvv messages.csv messages2.csv</comment>
EOF
            )
        ;
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $batchSize = $this->configuration->getOption('batchSize');
        $messageFiles = $input->getArgument('file');

        $stopWatch = new Stopwatch();
        $stopWatch->start('process');

        $time = microtime(true);
        $batchCallback = $output->getVerbosity() < OutputInterface::VERBOSITY_VERBOSE
            ? null
            : function(Message\Entry $entry, $totalNumber) use (&$output, $batchSize, &$time) {
                if (0 != $totalNumber % $batchSize) {
                    return;
                }
                $newTime = microtime(true);
                $output->writeln(sprintf(
                    '<comment>%d entries were processed.</comment> '.
                        'Batch execution time: <info>%d</info> milliseconds, memory usage: <info>%s</info>.',
                    $totalNumber,
                    round(($newTime - $time) * 1000, 1),
                    Helper::formatMemory(memory_get_usage(true))
                ));
                $time = $newTime;
            };

        $lapCallback = $output->getVerbosity() < OutputInterface::VERBOSITY_VERY_VERBOSE
            ? $batchCallback
            : function(Message\Entry $entry, $totalNumber) use (&$output, $batchCallback) {
                $output->writeln(sprintf(
                    '"%d" entries were processed, memory usage: <info>%s</info>.',
                    $totalNumber,
                    Helper::formatMemory(memory_get_usage(true))
                ));
                if (!is_null($batchCallback)) {
                    $batchCallback($entry, $totalNumber);
                }
            };

        $storage = $this->configuration->getStorage();

        $aggregator = new Message\Aggregator();
        $dataSources = [];

        if (count($messageFiles) < 1) {
            $connection = $this->configuration->getAmqpConnection();
            $channel = $connection->channel();

            $dataSources[] = new Message\Source\AmqpQueueReader($channel);
            $aggregator->run($batchSize, $dataSources, $storage, $lapCallback);

            $channel->close();
            $connection->close();

            return;
        }

        $isVerbose = $output->getVerbosity() >= OutputInterface::VERBOSITY_VERBOSE;
        $validatorChain = new Validator\ValidatorChain();
        $validatorChain
            ->attach(new Validator\File\Exists(), true)
            ->attach(new Validator\Callback([
                'callback' => function($fileName) {
                    return is_readable($fileName);
                },
                'message' => 'File is not readable',
            ]), true)
            ->attach(new Validator\File\FilesSize(['min' => 2]), true);

        foreach($messageFiles as $fileName) {
            if ($validatorChain->isValid($fileName)) {
                if ($isVerbose) {
                    $output->writeln(sprintf(
                        'Start parsing of "<info>%s</info>"...',
                        $fileName
                    ));
                }
                $dataSources[] = new Message\Source\Reader($fileName);
            } else {
                $output->writeln(sprintf(
                    '<error>Invalid file "%s": %s.</error> Skip it...',
                    $fileName,
                    implode('. ', $validatorChain->getMessages())
                ));
            }
        }
        if (1 > count($dataSources)) {
            throw new \InvalidArgumentException('Please provide at least one valid messages file.');
        }

        $aggregator->run($batchSize, $dataSources, $storage, $lapCallback);

        if ($isVerbose) {
            $event = $stopWatch->stop('process');
            $output->writeln(sprintf(
                'Execution time: <info>%d</info> milliseconds, memory usage: <info>%s</info>.',
                $event->getDuration(),
                Helper::formatMemory($event->getMemory())
            ));
        }
    }
}
