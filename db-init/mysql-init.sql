CREATE DATABASE IF NOT EXISTS musicdb;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `genres`;
CREATE TABLE `genres` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `genre` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `artists`;
CREATE TABLE `artists` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `genre` mediumint(9),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`genre`) REFERENCES genres(`id`) ON DELETE CASCADE
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=latin1;

INSERT INTO `genres` VALUES (1,'Pop'),(2,'Hard Rock');

INSERT INTO `artists` VALUES (1,'ABBA', 1),(2,'Aerosmith', 2),(3,'Backstreet Boys', 1),(4,'Black Eyed Peas', 1),(5,'Bon Jovi', 2);

INSERT INTO `albums` VALUES (1,'Number Ones','ABBA','Pop',2006),(2,'Toys in the Attic','Aerosmith','Hard Rock',1975),(3,'Millennium','Backstreet Boys','Pop',1999),(4,'The E.N.D.','Black Eyed Peas','Pop',2009),(5,'Slippery When Wet','Bon Jovi','Hard Rock',1986);

INSERT INTO `songs` VALUES (1,'Gimme! Gimme! Gimme!','ABBA','Number Ones'),(2,'Mamma Mia','ABBA','Number Ones'),(3,'Dancing Queen','ABBA','Number Ones'),(4,'Super Trouper','ABBA','Number Ones'),(5,'SOS','ABBA','Number Ones'),(6,'Summer Night City','ABBA','Number Ones'),(7,'Money, Money, Money','ABBA','Number Ones'),(8,'The Winner Takes It All','ABBA','Number Ones'),(9,'Chiquitita','ABBA','Number Ones'),(10,'One of Us','ABBA','Number Ones'),(11,'Knowing Me, Knowing You','ABBA','Number Ones'),(12,'Voulez-Vous','ABBA','Number Ones'),(13,'Fernando','ABBA','Number Ones'),(14,'Waterloo','ABBA','Number Ones'),(15,'The Name of the Game','ABBA','Number Ones'),(16,'I Do, I Do, I Do, I Do, I Do','ABBA','Number Ones'),(17,'Take a Chance on Me','ABBA','Number Ones'),(18,'I Have a Dream','ABBA','Number Ones'),(19,'Toys in the Attic','Aerosmith','Toys in the Attic'),(20,'Uncle Salty','Aerosmith','Toys in the Attic'),(21,"Adam's Apple",'Aerosmith','Toys in the Attic'),(22,'Walk This Way','Aerosmith','Toys in the Attic'),(23,'Big Ten Inch Record','Aerosmith','Toys in the Attic'),(24,'Sweet Emotion','Aerosmith','Toys in the Attic'),(25,'No More No More','Aerosmith','Toys in the Attic'),(26,'Round and Round','Aerosmith','Toys in the Attic'),(27,'You See Me Crying','Aerosmith','Toys in the Attic'),(28,'Larger than Life','Backstreet Boys','Millennium'),(29,'I Want It That Way','Backstreet Boys','Millennium'),(30,'Show Me the Meaning of Being Lonely','Backstreet Boys','Millennium'),(31,"It's Gotta Be You",'Backstreet Boys','Millennium'),(32,'I Need You Tonight','Backstreet Boys','Millennium'),(33,"Don't Want You Back",'Backstreet Boys','Millennium'),(34,"Don't Wanna Lose You Now",'Backstreet Boys','Millennium'),(35,'The One','Backstreet Boys','Millennium'),(36,'Back to Your Heart','Backstreet Boys','Millennium'),(37,'Spanish Eyes','Backstreet Boys','Millennium'),(38,'No One Else Comes Close','Backstreet Boys','Millennium'),(39,'The Perfect Fan','Backstreet Boys','Millennium'),(40,'Boom Boom Pow','Black Eyed Peas','The E.N.D.'),(41,'Rock That Body','Black Eyed Peas','The E.N.D.'),(42,'Meet Me Halfway','Black Eyed Peas','The E.N.D.'),(43,'Imma Be','Black Eyed Peas','The E.N.D.'),(44,'I Gotta Feeling','Black Eyed Peas','The E.N.D.'),(45,'Alive','Black Eyed Peas','The E.N.D.'),(46,'Missing You','Black Eyed Peas','The E.N.D.'),(47,'Ring-A-Ling','Black Eyed Peas','The E.N.D.'),(48,'Party All the Time','Black Eyed Peas','The E.N.D.'),(49,'Out of My Head','Black Eyed Peas','The E.N.D.'),(50,'Electric City','Black Eyed Peas','The E.N.D.'),(51,'Showdown','Black Eyed Peas','The E.N.D.'),(52,'Now Generation','Black Eyed Peas','The E.N.D.'),(53,'One Tribe','Black Eyed Peas','The E.N.D.'),(54,'Rockin to the Beat','Black Eyed Peas','The E.N.D.'),(55,'Let It Rock','Bon Jovi','Slippery When Wet'),(56,'You Give Love a Bad Name','Bon Jovi','Slippery When Wet'),(57,"Livin' on a Prayer",'Bon Jovi','Slippery When Wet'),(58,'Social Disease','Bon Jovi','Slippery When Wet'),(59,'Wanted Dead or Alive','Bon Jovi','Slippery When Wet'),(60,'Raise Your Hands','Bon Jovi','Slippery When Wet'),(61,'Without Love','Bon Jovi','Slippery When Wet'),(62,"I'd Die for You",'Bon Jovi','Slippery When Wet'),(63,'Never Say Goodbye','Bon Jovi','Slippery When Wet'),(64,'Wild in the Streets','Bon Jovi','Slippery When Wet');
