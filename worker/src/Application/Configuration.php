<?php
namespace Application;

use Symfony\Component\Yaml\Parser as YamlParser;
use PhpAmqpLib\Connection\AMQPSSLConnection;
use PhpAmqpLib\Connection\AMQPStreamConnection;

/**
 * Main application configuration.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class Configuration
{
    /**
     * Path to config file
     * @var string
     */
    protected $configFile;

    /**
     * Config options
     * @var array
     */
    protected $configOptions;

    /**
     * Application constructor.
     *
     * @param string $configFile Path to config
     */
    public function __construct($configFile)
    {
        $this->configFile = $configFile;
    }

    /**
     * Returns option value by its name.
     *
     * @param string $name
     * @return string
     */
    public function getOption($name)
    {
        if (!$this->configOptions) {
            $this->configOptions = $this->parseConfig();
        }

        if (!isset($this->configOptions[$name])) {
            throw new \InvalidArgumentException(sprintf('Unknown option "%s".', $name));
        }

        return $this->configOptions[$name];
    }

    /**
     * Creates storage for saving aggregated messages.
     *
     * @param string $certsDir
     * @param array $configOptions
     * @return Message\Storage
     */
    public function getStorage()
    {
        $certsDir = $this->getCertsDir();

        return new Message\Storage(
            $this->getOption('storageUrl'),
            $certsDir . $this->getOption('storageClientCert'),
            $certsDir . $this->getOption('storageCaCert')
        );
    }

    /**
     * Creates AMQP connection for retrieving messages.
     *
     * @return AMQPStreamConnection
     */
    public function getAmqpConnection()
    {
        $certsDir = $this->getCertsDir();

        return new AMQPSSLConnection(
            $this->getOption('rabbitServer'),
            $this->getOption('rabbitPort'),
            $this->getOption('rabbitUser'),
            $this->getOption('rabbitPassword'),
            $this->getOption('rabbitVhost'),
            [
                'capath' => $certsDir . $this->getOption('rabbitCaCert'),
                'verify_depth' => 2,
                'verify_peer' => true,
                'local_cert' => $certsDir . $this->getOption('rabbitClientCert'),
                'passphrase' => $certsDir . $this->getOption('rabbitClientKeyPassPhrase'),
            ]
        );
    }

    /**
     * Returns path to certs directory.
     *
     * @return string
     */
    protected function getCertsDir()
    {
        return dirname($this->configFile) . DIRECTORY_SEPARATOR . 'certificates' . DIRECTORY_SEPARATOR;
    }

    /**
     * Parses config file
     *
     * @return array
     */
    protected function parseConfig()
    {
        $yamlParser = new YamlParser();

        return $this->validate(
            $yamlParser->parse(file_get_contents($this->configFile)),
            $this->configFile
        );
    }

    /**
     * Validates a config file.
     *
     * @param mixed  $content
     * @param string $configFile
     *
     * @return array
     *
     * @throws \InvalidArgumentException
     */
    protected function validate($content, $configFile)
    {
        if (!is_array($content)) {
            throw new \InvalidArgumentException(
                sprintf('The config file "%s" is not valid.', $configFile)
            );
        }

        $requiredKeys = ['rabbitConnectionHeartbeat', 'rabbitServer', 'rabbitPort',
            'rabbitUser', 'rabbitPassword', 'rabbitVhost', 'storageCaCert',
            'rabbitClientCert', 'batchSize', 'rabbitClientKeyPassPhrase',
            'rabbitCaCert', 'storageUrl', 'storageClientCert',
        ];

        foreach ($requiredKeys as $key) {
            if (!array_key_exists($key, $content)) {
                throw new \InvalidArgumentException(sprintf(
                    'There is no "%s" value found in the config file "%s"',
                    $key,
                    $configFile
                ));
            }
        }

        return $content;
    }
}
