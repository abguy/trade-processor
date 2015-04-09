<?php

/**
 * Application entry point.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */

include __DIR__ . '/src/bootstrap.php';

$input = new \Symfony\Component\Console\Input\ArgvInput($argv);
$output = new \Symfony\Component\Console\Output\ConsoleOutput();

$configuration = new \Application\Configuration(
    implode(
        DIRECTORY_SEPARATOR,
        [__DIR__, 'config', 'config.yml']
    )
);
$application = new \Application\Main($configuration);
$application->run($input, $output);
