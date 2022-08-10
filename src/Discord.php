<?php

namespace SplmlFoundation\SplashMountainLegacyBackend;

/**
 * Class for interacting with the Discord API and database user store
 */
class Discord {

    /** @var \League\OAuth2\Client\Token\AccessToken $access_token */
    private $access_token;
    /** @var \PDO $database */
    private $database;
    /** @var string $table_name */
    private $table_name;
    /** @var \Whoali\Oauth2\Client\Provider\Discord $provider */
    private $provider;

    /**
     * @param \League\OAuth2\Client\Token\AccessToken | string $access_token The OAuth2 access token
     * @param \PDO $database The database to use
     * @param string $table_name The name of the table to use for user lookup
     */
    public function __construct($access_token, $database, $table_name) {
        //If the token is a string generate an AccessToken from it
        if(is_string($access_token)) {
            $this->access_token = new \League\OAuth2\Client\Token\AccessToken(["access_token" => $access_token]);
        }else {
            $this->access_token = $access_token;
        }

        $this->database = $database;
        $this->table_name = $table_name;
        $this->provider = new \Wohali\OAuth2\Client\Provider\Discord();
    }

    /**
     * Returns the details about a user given their User ID. If no ID is provided, the currently logged in user's details are returned instead.
     * 
     * This method also updates the database with a user's latest details if no ID is provided.
     * 
     * WARNING: Providing no User ID will result in an API request to Discord's servers. Ensure proper rate-limiting and protections for any code that calls this method. It is highly recommended to only call this method without an ID if an ID is not available, and to store that ID for later uses.
     * 
     * @param string $user_id The User ID to lookup information for
     * @return array An array containing all available information about a user
     * @throws \Exception If an error occurred while fetching the user's data
     */
    public function getUserDetails($user_id = null) {
        //If the ID is null, fetch the user's details from Discord directly
        if(is_null($user_id)) {
            $user = $this->provider->getResourceOwner($this->access_token)->toArray();

            $user_data = array();
            $user_data["id"] = $user["id"];
            $user_data["username"] = $user["username"];
            $user_data["discriminator"] = $user["discriminator"];
            $user_data["avatar_hash"] = $user["avatar"];

            //Check if the user exists in the database, and if they do, update their records with the new information
            $sql = "SELECT `clearance` FROM `$this->table_name` WHERE `id`=?";
            $stmt = $this->database->prepare($sql);
            $stmt->execute([$user_data["id"]]);

            if($stmt->rowCount() === 1) {
                $user_data["clearance"] = $stmt->fetch(\PDO::FETCH_ASSOC)["clearance"];

                $this->database->beginTransaction();

                try {
                    $sql = "UPDATE `$this->table_name` SET `username`=?, `discriminator`=?, `avatar_hash`=? WHERE `id`=?";
                    $stmt = $this->database->prepare($sql);
                    $stmt->execute([$user_data["username"], $user_data["discriminator"], $user_data["avatar_hash"], $user_data["id"]]);

                    $this->database->commit();
                }catch(\Exception $e) {
                    $this->database->rollBack();
                    throw $e;
                }
            }
            
            return $user_data;
        }

        //Otherwise pull the user's data from the database
        $sql = "SELECT `id`, `clearance`, `username`, `discriminator`, `avatar_hash` FROM `$this->table_name` WHERE `id`=?";
        $stmt = $this->database->prepare($sql);
        $stmt->execute([$user_id]);

        //If there is no matching records, return a placeholder user
        if($stmt->rowCount() !== 1) {
            return ["id" => $user_id, "username" => "UnknownUser", "discriminator" => "0001"];
        }

        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}

?>