<?php
namespace Application\Message\Source;

use Application\Message\Entry;

/**
 * Messages reader from csv files.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class Reader extends AbstractReader
{
    /**
     * File
     * @var \SplFileObject
     */
    protected $file;

    /**
     * Fields list (header from csv)
     * @var array
     */
    protected $fields;

    /**
     * Object constructor
     * @param string $fileName
     */
    public function __construct($fileName)
    {
        $this->file = new \SplFileObject($fileName);
        $this->file->setFlags(\SplFileObject::READ_CSV | \SplFileObject::DROP_NEW_LINE |
            \SplFileObject::SKIP_EMPTY | \SplFileObject::DROP_NEW_LINE);
        $this->fields = $this->file->fgetcsv();
    }

    /**
     * Check whether EOF has been reached.
     *
     * @return bool
     */
    public function valid()
    {
        return $this->file->valid();
    }

    /**
     * Returns next portion of data.
     *
     * @return Entry|null
     */
    public function next()
    {
        $values = $this->file->fgetcsv();
        if (!is_array($values)) {
            return null;
        }
        try {
            return static::parseEntryFromArray(
                array_combine($this->fields, $values)
            );
        } catch (\Exception $e) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Unable to process messages "%s" at line "%s":%s.',
                    $this->file->getFilename(),
                    implode(', ', $values),
                    PHP_EOL . $e->getMessage()
                ),
                $e->getCode(),
                $e
            );
        }
    }
}
