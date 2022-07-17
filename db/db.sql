DROP DATABASE IF EXISTS chess_platform;
CREATE DATABASE chess_platform;

USE chess_platform;

CREATE TABLE profile_page_types (
	type VARCHAR(255),
	
	PRIMARY KEY(type)
);
INSERT INTO profile_page_types (type) VALUES ('public'), ('private'), ('friends only');

CREATE TABLE statuses (
	status VARCHAR(255),
	
	PRIMARY KEY(status)
);
INSERT INTO statuses (status) VALUES ('Online'), ('Offline'), ('Away'), ('Looking for match'), ('In-game');

CREATE TABLE users (
	id VARCHAR(255),
	name VARCHAR(10) NOT NULL,
	tag INT NOT NULL,
	email VARCHAR(255) NOT NULL,
	password BINARY(128) NOT NULL,
	unrankedMMR INT NOT NULL DEFAULT 1500,
	rankedMMR INT NOT NULL DEFAULT 1500,
	createdAt DATETIME NOT NULL DEFAULT SYSDATE(),
	lastOnline DATETIME,
	lastPlayed DATETIME,
	avatar VARCHAR(255) NOT NULL DEFAULT '/avatars/default.png',
	profilePage VARCHAR(255) DEFAULT 'public',
	defaultStatus VARCHAR(255) DEFAULT 'Offline',
	status VARCHAR(255) DEFAULT 'Offline',
	statusText VARCHAR(255) DEFAULT 'Offline',
	matchIdInProgress VARCHAR(255),
	inQueue BOOLEAN NOT NULL DEFAULT FALSE,
	
	UNIQUE(email),
	UNIQUE(name, tag),
	PRIMARY KEY(id),
	FOREIGN KEY(profilePage) REFERENCES profile_page_types(type),
	FOREIGN KEY(defaultStatus) REFERENCES statuses(status),
	FOREIGN KEY(status) REFERENCES statuses(status),
	FOREIGN KEY(statusText) REFERENCES statuses(status)
);

CREATE TABLE match_types (
	type VARCHAR(255),

	PRIMARY KEY(type)
);
INSERT INTO match_types (type) VALUES ('ranked'), ('unranked'), ('private');

CREATE TABLE matches (
	id VARCHAR(255),
	createdAt DATETIME NOT NULL,
	duration TIME NOT NULL,
	type VARCHAR(255) NOT NULL,
	
	FOREIGN KEY(type) REFERENCES match_types(type),
	PRIMARY KEY(id)
);

CREATE TABLE scores (
	score FLOAT,

	PRIMARY KEY(score)
);
INSERT INTO scores (score) VALUES (1), (0), (0.5);

CREATE TABLE colors (
	color VARCHAR(255),

	PRIMARY KEY (color)
);
INSERT INTO colors (color) VALUES ('Black'), ('White');

CREATE TABLE scoreboard (
	matchId VARCHAR(255),
	userId VARCHAR(255),
	color VARCHAR(255),
	score FLOAT,
	mmrChange INT,
	mmrAfter INT,

	FOREIGN KEY(matchId) REFERENCES matches(id),
	FOREIGN KEY(userId) REFERENCES users(id),
	FOREIGN KEY(score) REFERENCES scores(score),
	FOREIGN KEY(color) REFERENCES colors(color),
	PRIMARY KEY(matchId, userId)
);

CREATE TABLE friend_list (
	userId VARCHAR(255),
	friendId VARCHAR(255),

	FOREIGN KEY(userId) REFERENCES users(id),
	FOREIGN KEY(friendId) REFERENCES users(id),
	PRIMARY KEY(userId, friendId)
);

CREATE TABLE notification_types (
	type VARCHAR(255),

	PRIMARY KEY(type)
);
INSERT INTO notification_types (type) VALUES ("friend_request"), ("friend_request_accepted");

CREATE TABLE notifications (
	id VARCHAR(255),
	senderId VARCHAR(255),
	receiverId VARCHAR(255),
	type VARCHAR(255),
	createdAt DATETIME NOT NULL DEFAULT SYSDATE(),
	removed BOOLEAN NOT NULL DEFAULT FALSE,
	seen BOOLEAN NOT NULL DEFAULT FALSE,

	FOREIGN KEY(senderId) REFERENCES users(id),
	FOREIGN KEY(receiverId) REFERENCES users(id),
	FOREIGN KEY(type) REFERENCES notification_types(type),
	PRIMARY KEY(id)
);

CREATE TABLE chatrooms (
	id VARCHAR(255),

	PRIMARY KEY(id)
);

CREATE TABLE chatroom_members (
	chatroomId VARCHAR(255),
	userId VARCHAR(255),

	FOREIGN KEY (chatroomId) REFERENCES chatrooms(id),
	FOREIGN KEY (userId) REFERENCES users(id),
	PRIMARY KEY (chatroomId, userId)
);

CREATE TABLE messages (
	id VARCHAR(255),
	senderId VARCHAR(255),
	createdAt DATETIME NOT NULL DEFAULT SYSDATE(),
	text VARCHAR(1024) NOT NULL COLLATE 'utf8mb4_general_ci',
	chatroomId VARCHAR(255),

	FOREIGN KEY(senderId) REFERENCES users(id),
	FOREIGN KEY(chatroomId) REFERENCES chatrooms(id),
	PRIMARY KEY(id)
);

CREATE TABLE received_messages (
	userId VARCHAR(255),
	messageId VARCHAR(255),
	seen BOOLEAN NOT NULL DEFAULT FALSE,

	FOREIGN KEY (userId) REFERENCES users(id),
	FOREIGN KEY (messageId) REFERENCES messages(id),
	PRIMARY KEY (userId, messageId)
);

CREATE TABLE stats (
	userId VARCHAR(255),
	matchType VARCHAR(255),
	gamesPlayed INT NOT NULL DEFAULT 0,
	wins INT NOT NULL DEFAULT 0,
	draws INT NOT NULL DEFAULT 0,
	losses INT NOT NULL DEFAULT 0,

	FOREIGN KEY (userId) REFERENCES users(id),
	FOREIGN KEY (matchType) REFERENCES match_types(type),
	PRIMARY KEY (userId, matchType)
);

CREATE VIEW leaderboard AS
SELECT ROW_NUMBER() OVER (ORDER BY rankedMMR DESC, name, tag) AS ranking, u.id, name, tag, rankedMMR, percentile, avatar
FROM users u
INNER JOIN
    ( WITH results AS (
        SELECT u1.id AS id, u1.rankedMMR AS mmr1, u2.rankedMMR AS mmr2, (CASE WHEN u1.rankedMMR >= u2.rankedMMR THEN 1 ELSE 0 END) AS greaterThanOrEqual
        FROM users u2
        INNER JOIN users u1
    )
    SELECT id, SUM(greaterThanOrEqual) / ( SELECT COUNT(id) FROM users ) * 100 AS percentile
    FROM results
    GROUP BY id ) p ON u.id = p.id
ORDER BY rankedMMR DESC, name, tag;

CREATE OR REPLACE USER 'api' IDENTIFIED BY 'HSgRp6kwpur7hcM0';
CREATE OR REPLACE USER 'chess' IDENTIFIED BY '3ps5uMfeI9q3lDjp';
CREATE OR REPLACE USER 'chat' IDENTIFIED BY 'oYvLAac7UCskVFCK';

GRANT ALL PRIVILEGES ON * to 'api';
GRANT ALL PRIVILEGES ON * to 'chess';
GRANT ALL PRIVILEGES ON * to 'chat';