<?php
namespace Application\Message\Source;

use Application\Message\Entry;
use Application\Message\Exception\InvalidFormatException;
use Symfony\Component\Validator\Validation;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Zend\Filter\Exception as ZendException;

/**
 * Message entries filter.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class ValidEntriesFilter implements DataSourceInterface
{
    /**
     * Data source
     * @var DataSourceInterface
     */
    protected $dataSource;

    /**
     * Validator
     * @var ValidatorInterface
     */
    protected $validator;

    /**
     * Object constructor
     *
     * @param DataSourceInterface $dataSource   Initial data source
     */
    public function __construct($dataSource)
    {
        $this->dataSource = $dataSource;
        $this->validator = Validation::createValidatorBuilder()
            ->enableAnnotationMapping()
            ->getValidator();
    }

    /**
     * Check whether EOF has been reached.
     *
     * @return bool
     */
    public function valid()
    {
        return $this->dataSource->valid();
    }

    /**
     * Returns next portion of data.
     *
     * @return Entry|null
     */
    public function next()
    {
        while($this->valid()) {
            try {
                $entry = $this->dataSource->next();
                if (!$entry instanceof Entry) {
                    continue;
                }
                $violations = $this->validator->validate($entry);
                if (0 < count($violations)) {
                    // todo@ Log violations
                    continue;
                }
            } catch (\InvalidArgumentException $e) {
                // todo@ Log exception
                continue;
            } catch (InvalidFormatException $e) {
                // todo@ Log this exception when we add logger to the system
                continue;
            }

            return $entry;
        }

        return null;
    }
}
