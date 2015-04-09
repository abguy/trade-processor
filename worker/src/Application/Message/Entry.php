<?php
namespace Application\Message;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Message entry object
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class Entry
{
    /**
     * User ID
     *
     * @Assert\NotBlank
     * @var string
     */
    protected $userId;

    /**
     * Entry time
     *
     * @Assert\NotBlank
     * @var \DateTime
     */
    protected $time;

    /**
     * Currency source
     *
     * @Assert\NotBlank
     * @Assert\Currency
     * @var string
     */
    protected $source;

    /**
     * Currency target
     *
     * @Assert\NotBlank
     * @Assert\Currency
     * @var string
     */
    protected $target;

    /**
     * Amount sold (from)
     *
     * @Assert\NotBlank
     * @Assert\Type(type="numeric")
     * @Assert\GreaterThanOrEqual(value=0)
     * @var float
     */
    protected $from;

    /**
     * Amount bought (to)
     *
     * @Assert\NotBlank
     * @Assert\Type(type="numeric")
     * @Assert\GreaterThanOrEqual(value=0)
     * @var float
     */
    protected $to;

    /**
     * Conversion rate
     *
     * @Assert\NotBlank
     * @Assert\Type(type="numeric")
     * @Assert\GreaterThanOrEqual(value=0)
     * @var float
     */
    protected $rate;

    /**
     * Originating country
     *
     * @Assert\NotBlank
     * @Assert\Country
     * @var string
     */
    protected $country;

    /**
     * Object constructor
     *
     * @param string $userId
     * @param \DateTime $time
     * @param string $source
     * @param string $target
     * @param float $from
     * @param float $to
     * @param float $rate
     * @param string $country
     */
    public function __construct($userId, \DateTime $time, $source, $target, $from, $to, $rate, $country)
    {
        $this->userId = $userId;
        $this->time = $time;
        $this->source = $source;
        $this->target = $target;
        $this->from = $from;
        $this->to = $to;
        $this->rate = $rate;
        $this->country = $country;
    }

    /**
     * User ID getter
     *
     * @return string
     */
    public function getUserId()
    {
        return $this->userId;
    }

    /**
     * Time getter
     *
     * @return \DateTime
     */
    public function getTime()
    {
        return $this->time;
    }

    /**
     * Source getter
     *
     * @return string
     */
    public function getSource()
    {
        return $this->source;
    }

    /**
     * Target getter
     *
     * @return string
     */
    public function getTarget()
    {
        return $this->target;
    }

    /**
     * Amount from getter
     *
     * @return float
     */
    public function getFrom()
    {
        return $this->from;
    }

    /**
     * Amount to getter
     *
     * @return float
     */
    public function getTo()
    {
        return $this->to;
    }

    /**
     * Rate getter
     *
     * @return float
     */
    public function getRate()
    {
        return $this->rate;
    }

    /**
     * Country getter
     *
     * @return string
     */
    public function getCountry()
    {
        return $this->country;
    }
}
