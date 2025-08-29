CREATE DATABASE NODEMYSQL;
 
USE NODEMYSQL;
 
 
CREATE TABLE IF NOT EXISTS Clientes(
      ID int NOT NULL AUTO_INCREMENT,
      Nome varchar(150) NOT NULL,
      Idade int NOT NULL,
      UF char(2) NOT NULL,
      PRIMARY KEY (ID)
);

INSERT INTO `clientes` (`Nome`, `Idade`, `UF`) VALUES ('Vinicius', '17', 'SC');
INSERT INTO `clientes` (`Nome`, `Idade`, `UF`) VALUES ('Enzo', '17', 'BA');
INSERT INTO `clientes` (`Nome`, `Idade`, `UF`) VALUES ('Kevin', '18', 'SP');