<?php
//Redirect page for WormAtlas
include('./dbaux.php');
$cell = $_GET['cell'];
$sex = $_GET['sex'];
$dbs = get_dbs($sex,$cell);

$link = '../neuronMaps/?cell='.$cell.'&sex='.$sex.'&db='.$dbs[0][0];

header("Location: $link");
exit();

?>

