<?php
namespace Application\Message\Source;

use Application\Message\Entry;

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
     * @return Entry|null
     */
    public function next();
}
