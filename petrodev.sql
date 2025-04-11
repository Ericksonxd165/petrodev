-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-04-2025 a las 20:01:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `petrodev`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','profesor') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `admin`
--

INSERT INTO `admin` (`id`, `email`, `password`, `rol`) VALUES
(1, 'admin', '$2b$10$8k4jwk0dFnSpKRfQh2qoYuUC96ZaLvSmjpj.yAOlMfUf.9I/GWiC2', 'admin'),
(2, 'profesor', '$2b$10$8k4jwk0dFnSpKRfQh2qoYuUC96ZaLvSmjpj.yAOlMfUf.9I/GWiC2', 'profesor');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id` int(11) NOT NULL,
  `user_id` int(6) UNSIGNED NOT NULL,
  `modulo1` decimal(5,2) DEFAULT NULL,
  `modulo2` decimal(5,2) DEFAULT NULL,
  `modulo3` decimal(5,2) DEFAULT NULL,
  `modulo4` decimal(5,2) DEFAULT NULL,
  `total` decimal(5,2) GENERATED ALWAYS AS (`modulo1` + `modulo2` + `modulo3` + `modulo4`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas`
--

CREATE TABLE `entregas` (
  `id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(6) UNSIGNED DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT current_timestamp(),
  `calificacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `entregas`
--

INSERT INTO `entregas` (`id`, `task_id`, `user_id`, `project_id`, `archivo`, `fecha_entrega`, `calificacion`) VALUES
(31, 45, 8, 8, NULL, '2025-02-01 22:07:54', 5),
(32, 46, 8, 9, NULL, '2025-02-02 18:51:38', 5),
(33, 48, 8, 12, NULL, '2025-02-17 15:53:39', NULL),
(34, 49, 8, 14, NULL, '2025-02-19 14:50:24', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `code` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `projects`
--

INSERT INTO `projects` (`id`, `title`, `code`, `created_at`, `user_id`) VALUES
(2, 'Mi segundo hola mundo', 'print(\'¡Hola, mundo!\')', '2024-12-29 23:01:41', NULL),
(3, 'otro proyecto', 'def generador():\n    yield 1\n    yield 2\n    yield 3\ngen = generador()\nfor val in gen:\n    print(val)', '2024-12-29 23:03:09', NULL),
(6, 'Proyecto de Prueba', 'print(\'¡Hola, mundo!\') maskdladaklklfasklklaklf', '2024-12-30 01:19:01', 8),
(7, 'Pruebas', 'XD', '2024-12-30 01:19:28', 8),
(8, 'Hello world', 'print(\"LKASDJKLSAJDLKSXDDDDLF\")', '2025-01-20 19:49:20', 8),
(9, 'Proyecto 1', 'print(\"puopo\")', '2025-01-30 01:00:33', 8),
(10, 'Proyecto 2', 'print(\"puasfsafasgfasgasfopo\")', '2025-02-01 22:09:33', 8),
(12, 'Tarea 1', 'print(\'¡Hola, Tarea 1\')', '2025-02-17 19:53:22', 8),
(13, 'Hola mundo', 'print(\'¡Hola, mASJDKLSAJKLDSALKDJSAKLDo!\')', '2025-02-19 18:45:25', 8),
(14, 'Bucle while', 'x = 0\nwhile x < 5:\n    print(x)\n    x += 1', '2025-02-19 18:50:14', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('3mC6eLEMreuer-fZGrRu8tzBOmun0BQh', 1742680541, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-03-22T21:52:46.591Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":8,\"email\":\"ericksonxd_164@hotmail.com\",\"nombre\":\"Erick Pereira\",\"telefono\":\"04129293905\",\"cedula\":\"30838542\",\"rol\":\"estudiante\"}}'),
('attZW7daZL1HpTnYApIxXkMedP0fJB0E', 1742680237, '{\"cookie\":{\"originalMaxAge\":86400000,\"expires\":\"2025-03-22T21:50:36.951Z\",\"httpOnly\":true,\"path\":\"/\"}}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `enunciado` text NOT NULL,
  `modulo` enum('modulo1','modulo2','modulo3','modulo4') NOT NULL,
  `fecha_limite` date NOT NULL,
  `visible` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tasks`
--

INSERT INTO `tasks` (`id`, `titulo`, `enunciado`, `modulo`, `fecha_limite`, `visible`) VALUES
(45, 'Estructuras de control', 'Realiza ejemplos de estructuras de control en python', 'modulo1', '2025-02-13', 0),
(46, 'Tarea cualquiera', 'Enunciado x', 'modulo1', '2025-02-18', 0),
(47, 'Tarea nueva', 'Nueva tarea', 'modulo1', '2025-02-20', 0),
(48, 'Entrega tarea', 'Tarea 1', 'modulo1', '2025-01-30', 0),
(49, 'Tarea modulo 3', 'genera un ciclo while que escriba n numeros', 'modulo3', '2025-02-27', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(6) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `reg_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `telefono` varchar(11) DEFAULT NULL,
  `recovery` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `cedula`, `email`, `password`, `reg_date`, `telefono`, `recovery`) VALUES
(8, 'Erick Pereira', '30838542', 'ericksonxd_164@hotmail.com', '$2b$10$o4o2/H6yAYVXIwlYxAUZ6Ovv2nILGU7WqZUnkwtQJE6ygtAW3mKSG', '2025-03-21 21:52:38', '04129293905', 0),
(13, 'Luisa', '28260839', 'benditaseatuexistencia2@gmail.com', '$2b$10$h.A7FoBQTvTPQhbXzTlsO.iYHDf2SlufdtMphfRnOt/dwavEFaUEm', '2025-01-27 22:53:38', '04121727978', 0),
(14, 'Oliver', '29925732', 'oliverdavidahri@gmail.com', '$2b$10$YfX/qRoEZpQbiCXk2ZAFxeKLr4sfdfe9l63eWm50MU65/Oby/ANxK', '2025-01-27 22:53:50', '04160432572', 0),
(15, 'fabio', '23008185', 'fabio@gmail.com', '$2b$10$0HbNH66lcTu2UT2j8CJcG.b//6d9NmKcQqYJTj/koDc78KPymtfjC', '2025-01-27 22:43:46', '04161785379', 0),
(16, 'lulu', '12375492', 'lulu@gmail.com', '$2b$10$qD/zUkGza.VjWA.01u1UMOGjUO/YnM8oJwEytJnTr1J1pNUcws.Jy', '2025-01-27 22:50:14', '04161721517', 0),
(17, 'Mary', '30609462', 'marytahdash@gmail.com', '$2b$10$rmMCvuEhr76z6nuGRnhJneA3entfiF1yACs.OKIMw2BaoPTYF7PGW', '2025-02-09 20:59:10', '04145051580', 0),
(18, 'Mike', '26927418', 'mike3iceman@gmail.com', '$2b$10$nL14JYlh5mdk77LgSDzPo.W/u7G1D.BDM/aZPqBa2zFldZsKEr5pq', '2025-02-09 21:07:52', '04125426453', 0),
(19, 'lui', '28273569', 'luisjose53128@gmail.com', '$2b$10$wVwEsJJKK1DjBf36VWyqq.WxpbprcTweauMcnfhoNVpYm3QRlPzJu', '2025-02-09 21:08:45', '04126776110', 0),
(20, 'Erick', '29925734', 'oliver.davidahrixd@gmail.com', '$2b$10$TuRzTvcaybliOmLVP9xH1eoY6Tc9PYppFsBW.O7vrjL3/F/4Fbcp.', '2025-02-19 18:36:35', '04125592299', 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `entregas`
--
ALTER TABLE `entregas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_id` (`project_id`),
  ADD KEY `fk_user_id` (`user_id`),
  ADD KEY `fk_task_id_unique` (`task_id`);

--
-- Indices de la tabla `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telefono` (`telefono`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `entregas`
--
ALTER TABLE `entregas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT de la tabla `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `entregas`
--
ALTER TABLE `entregas`
  ADD CONSTRAINT `fk_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_task_id_unique` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
