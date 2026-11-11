-- ==============================================================================
-- iMDB Admin — Estrutura e dados iniciais do banco de dados
--
-- Banco: imdb (criado pelo MySQL via variável MYSQL_DATABASE no docker-compose)
-- Charset: utf8mb4
--
-- Tabelas:
--   categoria   — gêneros dos filmes
--   diretor     — diretores dos filmes (relacionamento 1:N com filme)
--   ator        — elenco dos filmes (relacionamento N:M com filme)
--   filme       — catálogo de filmes (FK categoria e diretor)
--   filme_ator  — tabela de junção do elenco (N:M)
--   usuario     — usuários da aplicação (senha em bcrypt, login via JWT)
-- ==============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ------------------------------------------------------------------------------
-- Estrutura das tabelas
-- ------------------------------------------------------------------------------

CREATE TABLE `categoria` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `categoria` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categoria` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diretor` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `nacionalidade` VARCHAR(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ator` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `nacionalidade` VARCHAR(60) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `filme` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(100) NOT NULL,
  `original` VARCHAR(100) NOT NULL,
  `ano` SMALLINT UNSIGNED NOT NULL,
  `categoria_id` INT NOT NULL,
  `diretor_id` INT NOT NULL,
  `youtube` VARCHAR(20) NOT NULL,
  `capa` VARCHAR(255) NOT NULL,
  `sinopse` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_filme_categoria` (`categoria_id`),
  KEY `fk_filme_diretor` (`diretor_id`),
  CONSTRAINT `fk_filme_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`),
  CONSTRAINT `fk_filme_diretor` FOREIGN KEY (`diretor_id`) REFERENCES `diretor` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `filme_ator` (
  `filme_id` INT NOT NULL,
  `ator_id` INT NOT NULL,
  PRIMARY KEY (`filme_id`, `ator_id`),
  KEY `fk_filme_ator_ator` (`ator_id`),
  CONSTRAINT `fk_filme_ator_filme` FOREIGN KEY (`filme_id`) REFERENCES `filme` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_filme_ator_ator` FOREIGN KEY (`ator_id`) REFERENCES `ator` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(11) NOT NULL,
  `ativo` ENUM('Sim','Não') NOT NULL DEFAULT 'Sim',
  `criado_em` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  UNIQUE KEY `uq_usuario_cpf` (`cpf`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Dados iniciais
-- ------------------------------------------------------------------------------

INSERT INTO `categoria` (`id`, `categoria`) VALUES
(2, 'Comédia'),
(3, 'Ação'),
(4, 'Drama'),
(5, 'Aventura'),
(6, 'Ficção Científica'),
(7, 'Biografia'),
(8, 'Infantil');

INSERT INTO `diretor` (`id`, `nome`, `nacionalidade`) VALUES
(1, 'Jon Favreau', 'Estados Unidos'),
(2, 'Francis Lawrence', 'Estados Unidos'),
(3, 'Antoine Fuqua', 'Estados Unidos'),
(4, 'Simon McQuoid', 'Austrália'),
(5, 'Kevin Williamson', 'Estados Unidos'),
(6, 'David Frankel', 'Estados Unidos'),
(7, 'Justin Lin', 'Estados Unidos'),
(8, 'Craig Gillespie', 'Austrália'),
(9, 'Andrew Stanton', 'Estados Unidos'),
(10, 'Joe Russo', 'Estados Unidos');

INSERT INTO `ator` (`id`, `nome`, `nacionalidade`) VALUES
(1, 'Pedro Pascal', 'Chile'),
(2, 'Rachel Zegler', 'Estados Unidos'),
(3, 'Tom Blyth', 'Reino Unido'),
(4, 'Jaafar Jackson', 'Estados Unidos'),
(5, 'Karl Urban', 'Nova Zelândia'),
(6, 'Jessica McNamee', 'Austrália'),
(7, 'Anna Faris', 'Estados Unidos'),
(8, 'Regina Hall', 'Estados Unidos'),
(9, 'Meryl Streep', 'Estados Unidos'),
(10, 'Anne Hathaway', 'Estados Unidos'),
(11, 'Emily Blunt', 'Reino Unido'),
(12, 'Andrew Koji', 'Reino Unido'),
(13, 'Noah Centineo', 'Estados Unidos'),
(14, 'Milly Alcock', 'Austrália'),
(15, 'Tom Hanks', 'Estados Unidos'),
(16, 'Tim Allen', 'Estados Unidos'),
(17, 'Robert Downey Jr.', 'Estados Unidos'),
(18, 'Chris Hemsworth', 'Austrália');

INSERT INTO `filme` (`id`, `titulo`, `original`, `ano`, `categoria_id`, `diretor_id`, `youtube`, `capa`, `sinopse`) VALUES
(1, 'O Mandaloriano e Grogu', 'Mandalorian and Grogu', 2026, 3, 1, 'VM4svpk07UU', '/arquivos/1_1779562407.jpeg', 'O filme Star Wars: O Mandaloriano e Grogu acompanha o caçador de recompensas solitário Din Djarin e seu jovem aprendiz sensível à Força, Grogu, em uma nova aventura pela galáxia. A trama se passa após a queda do Império e foca na dinâmica de pai e filho. Enquanto a jovem Nova República tenta estabelecer a ordem, a dupla embarca em uma missão para caçar os esconderijos dos remanescentes imperiais espalhados pelo universo.'),
(2, 'Jogos Vorazes: A Cantiga dos Pássaros e das Serpentes', 'The Hunger Games: The Ballad of Songbirds and Snakes', 2026, 3, 2, 'psF5B6jJBV4', '/arquivos/1_1779562498.jpg', 'Anos após a guerra de Panem, a família de Coriolanus Snow enfrenta graves dificuldades financeiras e escassez de comida na Capital. Para salvar o nome da família, ele é selecionado para atuar como mentor durante a 10ª edição dos Jogos Vorazes. A sua tarefa, no entanto, não é fácil: ele recebe a missão de orientar Lucy Grey Baird, a garota tributo do empobrecido Distrito 12.'),
(3, 'Michael', 'Michael', 2026, 7, 3, '14YXeHKOBUY', '/arquivos/1_1779562574.jpg', 'Michael é uma cinebiografia musical que narra a vida e o legado de Michael Jackson. O longa acompanha sua jornada desde a descoberta de seu talento como líder do Jackson Five até se consolidar como o Rei do Pop, explorando suas ambições criativas e sua busca incansável para se tornar o maior artista do mundo.'),
(4, 'Mortal Kombat II', 'Mortal Kombat II', 2026, 3, 4, 'mXHanabYyOg', '/arquivos/1_1779562683.jpg', 'Mortal Kombat 2 acompanha os defensores do Plano Terreno em uma batalha decisiva contra o imperador Shao Kahn da Exoterra no décimo e último torneio Mortal Kombat. Com o destino da Terra em jogo, Lorde Raiden convoca Johnny Cage, um astro de ação arrogante de Hollywood, para se juntar aos demais guerreiros e lutar pelo equilíbrio dos reinos.'),
(5, 'Todo Mundo em Pânico 6', 'Scary Movie', 2026, 2, 5, 'bO_APd0MNVU', '/arquivos/1_1779562774.jpg', 'Em Todo Mundo em Pânico 6, Shorty, Ray, Cindy e Brenda estão de volta na mira do assassino mascarado. Vinte e seis anos após escaparem, o grupo se vê envolvido em mais uma trama repleta de ironia. Nenhum remake, prequel, requel, spin-off e sequência estará a salvo.'),
(6, 'O Diabo Veste Prada 2', 'The Devil Wears Prada 2', 2026, 4, 6, 'QYfzd3o5XzI', '/arquivos/1_1779562854.jpg', 'Em O Diabo Veste Prada 2, Miranda Priestly enfrenta o declínio da tradicional revista Runway em meio à crise da mídia impressa. Ela precisa negociar verbas publicitárias com Emily Charlton, sua ex-assistente que agora é uma poderosa executiva de luxo. Andy Sachs retorna como consultora para ajudar a revista.'),
(7, 'Street Fighter', 'Street Fighter', 2026, 3, 7, 'wgeXFqlISzc', '/arquivos/1_1779562915.jpg', 'Ambientado em 1993, o filme live-action de Street Fighter acompanha Ryu e Ken Masters quando são recrutados pela misteriosa Chun-Li para o World Warrior Tournament. A jornada revela uma conspiração mortal por trás do torneio, forçando os lutadores a confrontarem seus passados para salvar o mundo.'),
(8, 'Supergirl', 'Supergirl', 2026, 5, 8, 'XvaUMy2LcOQ', '/arquivos/1_1779562980.jpg', 'A sinopse oficial do filme Supergirl (baseado na HQ A Mulher do Amanhã) acompanha Kara Zor-El. Enquanto lida com suas origens e traumas, ela é forçada a unir forças com uma companheira improvável em uma jornada cósmica épica de vingança e justiça contra um adversário inesperado e implacável.'),
(9, 'Toy Story 5', 'Toy Story 5', 2026, 8, 9, '-YbiBclEEgo', '/arquivos/1_1779563034.jpg', 'Em Toy Story 5, Woody, Buzz Lightyear e Jessie enfrentam um novo e desafiador inimigo: a tecnologia. Quando a atenção de Bonnie é totalmente desviada por um novo e inteligente tablet interativo chamado Lilypad, os brinquedos precisam lidar com a dura realidade da era digital.'),
(10, 'Vingadores: Doutor Destino', 'Avengers: Doomsday', 2026, 3, 10, '3k9vXZ1A2O0', '/arquivos/1_1779563146.jpg', 'Vingadores: Doomsday (lançado no Brasil como Vingadores: Doutor Destino) é o quinto filme da equipe, com direção dos irmãos Russo. O Doutor Destino chegou oficialmente ao MCU, sendo um mestre da ciência e magia que desencadeará uma crise em cascata por todo o multiverso.');

INSERT INTO `filme_ator` (`filme_id`, `ator_id`) VALUES
(1, 1),
(2, 2),
(2, 3),
(3, 4),
(4, 5),
(4, 6),
(5, 7),
(5, 8),
(6, 9),
(6, 10),
(6, 11),
(7, 12),
(7, 13),
(8, 14),
(9, 15),
(9, 16),
(10, 17),
(10, 18);

-- Senhas (bcrypt):
--   admin@gmail.com  -> Admin@123
--   teste@teste.com  -> Teste@123
INSERT INTO `usuario` (`id`, `nome`, `email`, `senha`, `cpf`, `ativo`) VALUES
(1, 'Administrador', 'admin@gmail.com', '$2y$10$.aYrb1wIK3lFlmAhhc4lLOIcGAB5X93BBgNjno9LQWB/c6MdZgx4S', '09465010090', 'Sim'),
(2, 'Bill Gates', 'teste@teste.com', '$2y$10$xeIt5qPk6nYmDHfclwq0wurg8ySLnMo7zKN/P/UmZTNJkZZNioSzi', '42445418020', 'Sim');

-- ------------------------------------------------------------------------------
-- Ajuste dos AUTO_INCREMENT
-- ------------------------------------------------------------------------------

ALTER TABLE `categoria` MODIFY `id` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
ALTER TABLE `diretor` MODIFY `id` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `ator` MODIFY `id` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
ALTER TABLE `filme` MODIFY `id` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `usuario` MODIFY `id` INT NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
