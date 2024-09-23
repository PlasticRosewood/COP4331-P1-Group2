/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: givemespace
-- ------------------------------------------------------
-- Server version	11.5.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `ContactInfo`
--

DROP TABLE IF EXISTS `ContactInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ContactInfo` (
  `contact_id` int(11) NOT NULL AUTO_INCREMENT,
  `created_by_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `rating` int(11) DEFAULT 3,
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`contact_id`),
  KEY `created_by_id` (`created_by_id`),
  CONSTRAINT `ContactInfo_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `UserAccountInfo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ContactInfo`
--

LOCK TABLES `ContactInfo` WRITE;
/*!40000 ALTER TABLE `ContactInfo` DISABLE KEYS */;
INSERT INTO `ContactInfo` VALUES
(2,3,'FirstName','Lastname','Email','2024-09-23 20:33:30',3);
/*!40000 ALTER TABLE `ContactInfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserAccountInfo`
--

DROP TABLE IF EXISTS `UserAccountInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UserAccountInfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `session_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserAccountInfo`
--

LOCK TABLES `UserAccountInfo` WRITE;
/*!40000 ALTER TABLE `UserAccountInfo` DISABLE KEYS */;
INSERT INTO `UserAccountInfo` VALUES
(3,'asd','$2y$10$kMfYZyDD0zdaDy7PSpn1MupVt6hfdxOlFQeRKg6CtetdPLiSIzC8C','2024-09-23 20:14:09',NULL),
(4,'asda','$2y$10$KZF.mS0MLp6awas2saw2mOKkqjAs4jZlzatynVBrUBVBoim8UGXSm','2024-09-23 20:14:14',NULL),
(5,'Username','PasswordHash','2024-09-23 20:32:49',NULL);
/*!40000 ALTER TABLE `UserAccountInfo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2024-09-23 20:35:33
