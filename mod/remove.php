<?php

try {

    if (empty($_POST['ids'])) {

        throw new PDOException('Invalid request');

    }


    $ids = $_POST['ids'];
    $idsArray = explode('|', $ids);
    $placeholders = implode(',', array_fill(0, count($idsArray), '?'));


    $objDb = new PDO('sqlite:../dbase/shopping-list');
    $objDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    $sql = "DELETE FROM `items`
            WHERE `id` IN ({$placeholders})";

    $statement = $objDb->prepare($sql);

    if (!$statement->execute($idsArray)) {

        throw new PDOException('The execute method failed');

    }


    echo json_encode(array(

        'error' => false

    ), JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);




} catch(PDOException $e) {

    echo json_encode(array(

        'error' => true,
        'message' => $e->getMessage()

    ), JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);

}

?>