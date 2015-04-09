<?php
namespace Application\Message\Source;

use Application\Message\Entry;

use Zend\InputFilter\Input;
use Zend\InputFilter\InputFilter;
use Zend\Validator;
use Zend\Filter;
use Zend\I18n\Filter\NumberParse;

/**
 * Abstract messages reader.
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
abstract class AbstractReader implements DataSourceInterface
{
    /**
     * Creates entry by raw data
     *
     * @param Array $data
     * @return Entry
     */
    protected static function parseEntryFromArray(Array $data)
    {
        $userId = new Input('userId');
        $userId->getFilterChain()->attach(new Filter\StringTrim());

        $time = new Input('time');
        $time->getValidatorChain()->attach(new Validator\Date('d-M-y H:i:s'));
        $time->getFilterChain()
            ->attach(new Filter\DateTimeFormatter(['format' => 'd-M-y H:i:s']))
            ->attach(new Filter\Callback(function($value) {
                return new \DateTime($value);
            }));

        $source = new Input('source');
        $source->getFilterChain()->attach(new Filter\StringTrim());

        $target = new Input('target');
        $target->getFilterChain()->attach(new Filter\StringTrim());

        $from = new Input('from');
        $from->getFilterChain()
            ->attach(new Filter\StringTrim())
            ->attach(new Filter\ToNull())
            ->attach(new NumberParse());

        $to = new Input('to');
        $to->getFilterChain()
            ->attach(new Filter\StringTrim())
            ->attach(new Filter\ToNull())
            ->attach(new NumberParse());

        $rate = new Input('rate');
        $rate->getFilterChain()
            ->attach(new Filter\StringTrim())
            ->attach(new Filter\ToNull())
            ->attach(new NumberParse());

        $country = new Input('country');
        $country->getFilterChain()->attach(new Filter\StringTrim());

        $inputFilter = new InputFilter();
        $inputFilter
            ->add($userId)
            ->add($time)
            ->add($source)
            ->add($target)
            ->add($from)
            ->add($to)
            ->add($rate)
            ->add($country)
            ->setData($data);

        return new Entry(...array_values($inputFilter->getValues()));
    }
}
