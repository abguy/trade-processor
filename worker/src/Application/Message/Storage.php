<?php
namespace Application\Message;

use Zend\Http\Client;

/**
 * Storage for aggregated entries
 *
 * @author Alexey Belyaev <Alexey.V.Belyaev@gmail.com>
 */
class Storage
{
    /**
     * URL to storage RESTful entry point
     *
     * @var string
     */
    protected $url;

    /**
     * Path to storage client certificate
     *
     * @var string
     */
    protected $clientCert;

    /**
     * Path to storage client key
     *
     * @var string
     */
    protected $clientKey;

    /**
     * Path to storage server CA certificate (public part)
     *
     * @var string
     */
    protected $caCert;

    /**
     * Object constructor
     *
     * @param string $url
     * @param string $clientCert
     * @param string $caCert
     */
    public function __construct($url, $clientCert, $caCert)
    {
        $this->url = $url;
        $this->clientCert = $clientCert;
        $this->caCert = $caCert;
    }

    /**
     * Saves aggregated data to storage.
     *
     * @param array
     */
    public function save(array $data)
    {
        $client = new Client($this->url);
        $client
            ->setOptions([
                'sslcert' => $this->clientCert,
                'sslcapath' => $this->caCert,
                'sslverifypeer' => true,
            ])
            ->setMethod('POST')
            ->setRawBody(json_encode($data));

        try {
            $client->send();
        } catch (\Exception $e) {
            // todo@ add exception handling here
            throw $e;
        }
    }
}
