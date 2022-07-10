<?php

/**
 * Generates a JWT nonce
 * @param string $secret The secret used to sign the JWT
 * @param string $nonce The nonce to be signed
 * @return string The JWT nonce
 */
function generate_nonce($secret, $nonce) {
    $header = base64_encode_url(json_encode(array(
        "alg" => "HS256",
        "typ" => "JWT"
    )));

    $payload = base64_encode_url(json_encode(array(
        "exp" => time() + 60,
        "iat" => time(),
        "jti" => $nonce
    )));

    $signature = base64_encode_url(hash_hmac("sha256", $header . "." . $payload, $secret, true));

    return $header . "." . $payload . "." . $signature;
}

/**
 * Verifies a JWT nonce created by generate_nonce()
 * @param string $jwt The JWT nonce to verify
 * @param string $nonce The nonce that was encoded in the JWT
 * @param string $secret The secret used to sign the JWT
 * @return bool True if the JWT is valid, false otherwise
 */
function verify_nonce($jwt, $nonce, $secret) {
    $parts = explode(".", $jwt);

    if(count($parts) != 3) {
        return false;
    }

    //Decode the JWT
    $header = json_decode(base64_decode_url($parts[0]), true);
    $payload = json_decode(base64_decode_url($parts[1]), true);
    $signature = base64_decode_url($parts[2]);

    //Verify the header
    if($header["alg"] != "HS256" || $header["typ"] != "JWT") {
        return false;
    }

    //Verify the expiration time
    if($payload["exp"] < time() || $payload["iat"] > time()) {
        return false;
    }

    //Verify the nonce
    if($payload["jti"] != $nonce) {
        return false;
    }

    //Verify the signature
    if(hash_hmac("sha256", $parts[0] . "." . $parts[1], $secret, true) != $signature) {
        return false;
    }

    return true;
}

/**
 * Encodes a string a URL safe base64 string
 */
function base64_encode_url($string) {
    return str_replace(['+','/','='], ['-','_',''], base64_encode($string));
}

/**
 * Decodes a URL safe base64 string
 */
function base64_decode_url($string) {
    return base64_decode(str_replace(['-','_'], ['+','/'], $string));
}

?>