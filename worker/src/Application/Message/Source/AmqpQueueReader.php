<?php
namespace Application\Message\Source;

use PhpAmqpLib\Connection\AMQPSSLConnection;
use PhpAmqpLib\Channel\AMQPChannel;
use PhpAmqpLib\Message\AMQPMessage;
use Application\Message\Entry;
use Application\Message\Exception\InvalidFormatException;
use Application\Message\Exception\TimeoutException;

/**
 * Message reader from RabbitMQ queue.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class AmqpQueueReader extends AbstractReader
{
    /**
     * AMQP connection params.
     * @var array
     */
    protected $connectionParams;

    /**
     * AMQP connection timeout in seconds.
     * @var int
     */
    protected $timeout;

    /**
     * AMQP connection
     * @var AMQPSSLConnection
     */
    protected $connection;

    /**
     * AMQP channel
     * @var AMQPChannel
     */
    protected $channel;

    /**
     * Message body received from the AMQP queue.
     * @see self::onNewMessage()
     * @var string
     */
    protected $messageBody;

    /**
     * Object constructor
     * @param array $connection params
     * @param int $timeout Timeout in seconds
     */
    public function __construct(Array $connectionParams, $timeout)
    {
        $this->connectionParams = $connectionParams;
        $this->timeout = $timeout;

        $this->connection = new AMQPSSLConnection(...$this->connectionParams);
        $this->openChannel();
    }

    /**
     * Object destructor
     */
    public function __destruct()
    {
        $this->channel->close();
        $this->connection->close();
    }

    /**
     * Check whether EOF has been reached.
     *
     * @return bool
     */
    public function valid()
    {
        return true;
    }

    /**
     * Returns next portion of data.
     *
     * @param AMQPMessage $message
     */
    public function onNewMessage(AMQPMessage $message)
    {
        $this->messageBody = $message->body;

        // todo@ We should confirm delivering after saving of aggregated data to the storage.
        $this->channel->basic_ack($message->delivery_info['delivery_tag']);
    }

    /**
     * Returns next portion of data.
     *
     * @throws TimeoutException
     * @return Entry|null
     */
    public function next()
    {
        $this->messageBody = null;

        try  {
            $this->channel->wait(null, false, $this->timeout);
        } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {
            // Connection is closed. Try to reconnect and throw the exception further.
            $this->reconnect();
            throw new TimeoutException(
                sprintf('AMQP queue reading timeout: %s.', $e->getMessage()),
                $e->getCode(),
                $e
            );
        }
        if (is_null($this->messageBody)) {
            throw new \RuntimeException('Unable to read the next message from the queue.');
        }

        try {
            return static::parseMessage($this->messageBody);
        } catch (InvalidFormatException $e) {
            throw new InvalidFormatException(
                sprintf(
                    'Unable to process message "%s":%s.',
                    $this->messageBody,
                    PHP_EOL . $e->getMessage()
                ),
                $e->getCode(),
                $e
            );
        }
    }

    /**
     * Creates entry by raw data
     *
     * @param string $message
     * @return Entry
     */
    protected static function parseMessage($message)
    {
        $data = json_decode($message, true);
        if (!is_array($data)) {
            throw new InvalidFormatException(
                sprintf('%s is not valid JSON array', $message)
            );
        }

        $map = [
            'currencyFrom' => 'source',
            'currencyTo' => 'target',
            'amountSell' => 'from',
            'amountBuy' => 'to',
            'timePlaced' => 'time',
            'originatingCountry' => 'country',
        ];

        foreach($map as $sourceKey => $targetKey) {
            if (!isset($data[$sourceKey])) {
                continue;
            }
            $data[$targetKey] = $data[$sourceKey];
            unset($data[$sourceKey]);
        }

        return static::parseEntryFromArray($data);
    }

    /**
     * Creates new connection.
     */
    protected function reconnect()
    {
        $this->connection->reconnect();
        $this->openChannel();
    }

    /**
     * Opens the channel.
     */
    protected function openChannel()
    {
        $this->channel = $this->connection->channel();
        $this->channel->basic_qos(null, 1, null); // Prefetch 1 message from the queue.
        $this->channel->basic_consume('messages', '', false, false, false, false, [$this, 'onNewMessage']);
    }
}
