<?php

/**
 * Application bootstrap.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */

// This makes our life easier when dealing with paths. Everything is relative to the application root now.
chdir(dirname(__DIR__));

if (!file_exists('vendor/autoload.php')) {
    echo <<<MSG
Please install required dependencies using the following commands:
curl -s https://getcomposer.org/installer | php --
php composer.phar install --no-dev

MSG;

    exit(0);
}

$loader = include 'vendor/autoload.php';

if (class_exists('\Symfony\Component\Debug\Debug')) {
    \Symfony\Component\Debug\Debug::enable();
}

if (!ini_get('date.timezone') && function_exists('date_default_timezone_get')) {
    date_default_timezone_set(@date_default_timezone_get());
}

\Locale::setDefault('en');
\Doctrine\Common\Annotations\AnnotationRegistry::registerLoader(array($loader, 'loadClass'));
