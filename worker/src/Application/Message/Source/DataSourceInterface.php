<?php
namespace Application\Message\Source;

use Application\Message\Entry;
use Application\Message\Exception\TimeoutException;

/**
 * Data source interface
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
interface DataSourceInterface
{
    /**
     * Check whether EOF has been reached.
     *
     * @return bool
     */
    public function valid();

    /**
     * Returns next portion of data.
     *
     * @throws TimeoutException
     * @return Entry|null
     */
    public function next();
}
