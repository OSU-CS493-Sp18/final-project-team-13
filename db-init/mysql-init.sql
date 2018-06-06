CREATE DATABASE IF NOT EXISTS music-api;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `artists`;
CREATE TABLE `artists` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `albums`;
CREATE TABLE `albums` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `genre` varchar(255) NOT NULL,
  `year` int(9) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `songs`;
CREATE TABLE `songs` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `artist` varchar(255) NOT NULL,
  `album` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=latin1;

INSERT INTO `artists` VALUES (1,'ABBA'),(2,'Aerosmith'),(3,'Backstreet Boys'),(4,'Black Eyed Peas'),(5,'Bon Jovi');

INSERT INTO `albums` VALUES (1,'Number Ones','ABBA','Pop',2006),(2,'Toys in the Attic','Aerosmith','Hard Rock',1975),(3,'Millennium','Backstreet Boys','Pop',1999),(4,'The E.N.D.','Black Eyed Peas','Pop',2009),(5,'Slippery When Wet','Bon Jovi','Hard Rock',1986);

INSERT INTO `songs` VALUES (1,'Gimme! Gimme! Gimme!'),(2,'Mamma Mia'),(3,'Dancing Queen'),(4,'Super Trouper'),(5,'SOS'),(6,'Summer Night City'),(7,'Money, Money, Money'),(8,'The Winner Takes It All'),(9,'Chiquitita'),(10,'One of Us'),(11,'Knowing Me, Knowing You'),(12,'Voulez-Vous'),(13,'Fernando'),(14,'Waterloo'),(15,'The Name of the Game'),(16,'I Do, I Do, I Do, I Do, I Do'),(17,'Take a Chance on Me'),(18,'I Have a Dream'),(19,'Toys in the Attic'),(20,'Uncle Salty'),(21,'Adam\'s Apple'),(22,'Walk This Way'),(23,'Big Ten Inch Record'),(24,'Sweet Emotion'),(25,'No More No More'),(26,'Round and Round'),(27,'You See Me Crying'),(28,'Larger than Life'),(29,'I Want It That Way'),(30,'Show Me the Meaning of Being Lonely'),(31,'It\'s Gotta Be You'),(32,'I Need You Tonight'),(33,'Don\'t Want You Back'),(34,'Don\'t Wanna Lose You Now'),(35,'The One'),(36,'Back to Your Heart'),(37,'Spanish Eyes'),(38,'No One Else Comes Close'),(39,'The Perfect Fan'),(40,'Boom Boom Pow'),(41,'Rock That Body'),(42,'Meet Me Halfway'),(43,'Imma Be'),(44,'I Gotta Feeling'),(45,'Alive'),(45,'Missing You'),(46,'Ring-A-Ling'),(47,'Party All the Time'),(48,'Out of My Head'),(49,'Electric City'),(50,'Showdown'),(51,'Now Generation'),(52,'One Tribe'),(53,'Rockin to the Beat'),(54,'Let It Rock'),(55,'You Give Love a Bad Name'),(56,'Livin\' on a Prayer'),(57,'Social Disease'),(58,'Wanted Dead or Alive'),(59,'Raise Your Hands'),(60,'Without Love'),(61,'I\'d Die for You'),(62,'Never Say Goodbye'),(63,'Wild in the Streets');
