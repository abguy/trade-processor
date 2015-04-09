<?php
namespace Application\Command\Tests;

use Symfony\Component\Console\Tester\CommandTester;
use Application\Configuration;
use Application\Command\RunCommand;
use Application\Message;

/**
 * Tests for RunCommand.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class RunCommandTest extends \PHPUnit_Framework_TestCase
{
    /**
     * Test for execute with wrong arguments
     *
     * @expectedException \InvalidArgumentException
     * @expectedExceptionMessage Please provide at least one valid messages file.
     */
    public function testNoFile()
    {
        $configFile = $this->getConfigFile();
        $configuration = new Configuration($configFile);
        $command = new RunCommand($configuration);

        $commandTester = new CommandTester($command);
        $commandTester->execute(['file' => ['not-existent.file.csv']]);
    }

    /**
     * Success tests
     *
     * @dataProvider successDataProvider
     * @param array $files Files list to pass into command
     * @param int $batchSize Number of messages to aggregate
     * @param string $expected File name with expected output
     */
    public function testSuccess($files, $batchSize, $expected)
    {
        $storage = $this->getMockBuilder(Message\Storage::class)
            ->disableOriginalConstructor()
            ->getMock();

        $configuration = $this->getMockBuilder(Configuration::class)
            ->disableOriginalConstructor()
            ->getMock();

        $configuration
            ->method('getStorage')
            ->will($this->returnValue($storage));

        $configuration
            ->method('getOption')
            ->will($this->returnValue($batchSize));

        $command = new RunCommand($configuration);

        $options['file'] = [];
        foreach ($files as $file) {
            $options['file'][] = ('not-existent.csv' == $file)
                ? 'not-existent.csv'
                : __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . $file;
        }

        $expectedData = [];
        $expectedData[] = json_decode(
            file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . $expected),
            true
        );

        $storage->expects($this->once())
             ->method('save')
             ->with($this->equalTo($expectedData[0]));

        $commandTester = new CommandTester($command);
        $commandTester->execute($options);
        $this->assertEquals(0, $commandTester->getStatusCode());
    }

    public function successDataProvider()
    {
        return [
            [['messages.csv'], 5, 'storage-basic.json'],
            [['messages.csv', 'messages.csv'], 10, 'storage-doubled.json'],
            [['messages.csv', 'messages-other.csv', 'messages.csv'], 15, 'storage-doubled-other.json'],
            [['messages-invalid.csv', 'messages.csv'], 5, 'storage-basic.json'],
            [['messages-invalid.csv', 'messages.csv', 'messages.csv'], 10, 'storage-doubled.json'],
            [['messages-invalid.csv', 'messages.csv', 'messages-other.csv', 'messages.csv'], 15, 'storage-doubled-other.json'],
        ];
    }


    /**
     * Creates and returns command
     *
     * @return RunCommand
     */
    protected function getConfigFile()
    {
        return __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'config.yml';
    }
}
