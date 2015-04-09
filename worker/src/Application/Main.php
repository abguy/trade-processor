<?php
namespace Application;

use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Application\Command\RunCommand;

/**
 * Main application.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class Main extends Application
{
    /**
     * Application constructor.
     *
     * @param Configuration $configuration
     */
    public function __construct(Configuration $configuration)
    {
        parent::__construct('Market Trade Processor Worker', '0.0.1');
        $this->add(new RunCommand($configuration));
    }

    /**
     * Configures the input and output instances based on the user arguments and options.
     *
     * @param InputInterface  $input  An InputInterface instance
     * @param OutputInterface $output An OutputInterface instance
     */
    protected function configureIO(InputInterface $input, OutputInterface $output)
    {
        // Make output decorated by default
        $output->setDecorated(true);
        parent::configureIO($input, $output);
    }

    /**
     * Gets the name of the command based on input.
     *
     * @param InputInterface $input The input interface
     *
     * @return string The command name
     */
    protected function getCommandName(InputInterface $input)
    {
        $firstArgument = $input->getFirstArgument();
        if (array_key_exists($firstArgument, $this->all())) {
            return $firstArgument;
        }

        // Make trick for using Symfony command by default if no any command name in argv
        $this->getDefinition()->setArguments([]);
        return 'worker:run';
    }
}
