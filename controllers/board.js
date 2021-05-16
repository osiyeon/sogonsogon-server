const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);

const utils = require('../utils');

const controller = {
    async createBoard(req, res, next) {
        try {
            const user_no = req.users.user_no;
            const title = req.body.title;
            const content = req.body.content;
            const category = req.body.category;
            const category_no = req.body.category_no;

            let region_no = null;
            let sector_no = null;

            if (category === 'region') region_no = category_no;
            else if (category == 'sector') sector_no = category_no;

            const connection = await pool.getConnection(async (conn) => conn);
            try {
                await connection.beginTransaction();
                await connection.query(
                    `
                INSERT INTO 
                boards(user_no, title, content, region_bcode, sector_no)
                VALUE (?, ?, ?, ?, ?);
                `,
                    [user_no, title, content, region_no, sector_no]
                );
                await connection.commit();
                next({ success: `ok`, result: {}, message: `게시글이 정상적으로 등록되었습니다.` })
            } catch (e) {
                await connection.rollback();
                next(e);
            } finally {
                connection.release();
            }
        } catch (e) {
            next(e);
        }
    },
    async editBoard(req, res, next) {
        try {
            const board_no = req.body.board_no;
            const title = req.body.title;
            const content = req.body.content;
            const category = req.body.category;
            const category_no = req.body.category_no;

            const [result] = await pool.query(
                `
            SELECT *
            FROM boards
            WHERE no = ?
            AND enabled = 1;
            `,
                [board_no]
            );
            if (result.length < 1) throw ({ success: `error`, result: {}, message: `게시글이 존재하지 않습니다.` });
            else {
                const connection = await pool.getConnection(async (conn) => conn);
                try {
                    await connection.beginTransaction();

                    let region_no = null;
                    let sector_no = null;

                    if (category === 'region') region_no = category_no;
                    else if (category == 'sector') sector_no = category_no;

                    await connection.query(
                        `
                    UPDATE boards
                    SET 
                    title = ?,
                    content = ?,
                    region_bcode = ?,
                    sector_no = ?
                    WHERE no = ?
                    AND enabled = 1;
                    `,
                        [title, content, region_no, sector_no, board_no]
                    );
                    await connection.commit();
                    next({ success: `ok`, result: {}, message: `게시글이 정상적으로 변경되었습니다` })
                } catch (e) {
                    await connection.rollback();
                    next(e);
                } finally {
                    connection.release();
                }
            }
        } catch (e) {
            next(e);
        }
    },
    async removeBoard(req, res, next) {
        try {
            const user_no = req.users.user_no;
            const board_no = req.query.board_no;

            const [result1] = await pool.query(
                `
                SELECT
                COUNT(*) AS 'count'
                FROM boards
                WHERE enabled = 1
                AND user_no = ?
                AND no = ?;
            `,
                [user_no, board_no]
            );
            // const [result2] = await pool.query(
            //     `
            //     SELECT
            //     COUNT(*) AS 'count'
            //     FROM comments
            //     WHERE enabled = 1
            //     AND board_no = ?
            //     `,
            //     [board_no]
            // );
            if (result1[0].count < 1) throw Error(`해당 게시글이 존재하지 않거나 해당 게시글 삭제 권한이 없습니다.`);

            const connection = await pool.getConnection(async (conn) => conn);
            try {
                await connection.beginTransaction();

                await connection.query(`
                UPDATE boards b
                LEFT JOIN comments c
                ON c.board_no = b.no
                SET b.remove_datetime = NOW(),
                c.remove_datetime = NOW(),
                b.enabled = 0,
                c.enabled = 0
                WHERE b.no = ?
                AND b.enabled = 1
                `, [board_no])

                await connection.commit();
                next({ message: `게시글이 정상적으로 삭제되었습니다.` })


                //     if (result2[0].count < 1) {
                //         await connection.query(
                //             `
                // UPDATE boards
                // SET
                // remove_datetime = NOW(),
                // enabled = 0
                // where no = ?
                // `,
                //             [board_no]
                //         );
                //         await connection.commit();
                //         next({ success: `ok`, result: {}, message: `게시글이 정상적으로 삭제되었습니다.` })
                //     } else {
                //         await connection.query(
                //             `
                //     UPDATE boards t1
                //     RIGHT JOIN comments t2 
                //     ON (t2.board_no = t1.no)
                //     SET
                //     t1.remove_datetime = NOW(),
                //     t2.remove_datetime = NOW(),
                //     t1.enabled = 0,
                //     t2.enabled = 0
                //     WHERE t1.no = ?
                //     AND t1.user_no = ?
                // `,
                //             [board_no, user_no]
                //         );
                //         await connection.commit();
                //         next({ success: `ok`, result: {}, message: `게시글이 정상적으로 삭제되었습니다.` })
                //     }
            } catch (e) {
                await connection.rollback();
                next(e);
            } finally {
                connection.release();
            }
        } catch (e) {
            next(e);
        }
    },
    async board(req, res, next) {
        try {
            const user_no = req.users.user_no;
            const board_no = req.query.board_no;

            const [results] = await pool.query(
                `
                SELECT 
                b.no AS 'board_no',
                b.region_bcode,
                b.sector_no,
                b.title AS 'board_title',
                b.content AS 'board_content',
                b.views,
                b.likes,
                comments,
                b.create_datetime,
                b.update_datetime,
                b.remove_datetime
                FROM boards AS b
                LEFT OUTER JOIN (
                    SELECT COUNT(*) AS 'comments', board_no
                    FROM comments 
                    WHERE board_no = ?
                    AND enabled = 1
                    ) AS c 
                    ON (b.no = c.board_no)
                    WHERE b.no = ?
                    AND b.enabled = 1;
                    `,
                [board_no, board_no]
            );
            // if (results.length < 1) throw ({ success: `error`, message: `게시글이 존재하지 않습니다.` })
            if (results.length < 1) throw Error(`해당 게시글이 존재하지 않습니다.`)
            else {
                const is_mine = user_no === results[0].user_no ? true : false;
                results[0].comments = results[0].comments === null ? 0 : results[0].comments

                const connection = await pool.getConnection(async (conn) => conn);
                try {
                    await connection.beginTransaction();
                    await connection.query(
                        `
                    UPDATE boards
                    SET 
                    views = IFNULL(views, 0) + 1
                    WHERE no = ?
                    AND enabled = 1;
                    `,
                        [board_no]
                    ); // 조회수 수정

                    utils.formatting_datetime(results);

                    await connection.commit();
                    next({ is_mine, ...results[0] })
                    // next({ success: `ok`, result: { is_mine, ...results[0], comments } })
                } catch (e) {
                    await connection.rollback();
                    //throw e
                    next(e);
                } finally {
                    connection.release();
                }
            }
        } catch (e) {
            //throw e;
            next(e);
        }
    },
    async like(req, res, next) {
        try {
            const board_no = req.query.board_no;
            const [result] = await pool.query(
                `
            SELECT *
            FROM boards
            WHERE no = ?
            AND enabled = 1;
            `,
                [board_no]
            );
            if (result.length < 1) throw ({ success: `error`, result: {}, message: `게시글이 존재하지 않습니다.` });
            else {
                const connection = await pool.getConnection(async (conn) => conn);
                try {
                    await connection.beginTransaction();
                    await connection.query(
                        `
                    UPDATE boards
                    SET 
                    likes = IFNULL(likes, 0) + 1
                    WHERE no = ?
                    AND enabled = 1;
                    `,
                        [board_no]
                    );

                    await connection.commit();
                    next({ success: `ok`, result: {}, message: `좋아요 완료` })
                } catch (e) {
                    await connection.rollback();
                    next(e);
                } finally {
                    connection.release();
                }
            }
        } catch (e) {
            next(e);
        }
    },
    async myBoards(req, res, next) {
        try {
            const user_no = req.users.user_no;
            const count = req.query.count;
            const page = req.query.page;

            const [results] = await pool.query(
                `
                SELECT count(*) AS 'total_count'
                FROM boards 
                WHERE user_no = ?
                AND enabled = 1;
                `, [user_no])

            const [results1] = await pool.query(
                `
                SELECT 
                b.no AS 'board_no',
                b.user_no,
                b.region_bcode,
                b.sector_no,
                b.title AS 'board_title',
                b.content AS 'board_content',
                b.views,
                b.likes,
                comments,
                b.create_datetime,
                b.update_datetime,
                b.remove_datetime
                FROM boards AS b
                LEFT OUTER JOIN(
                    SELECT COUNT(*) AS 'comments', board_no
                    FROM comments
                    WHERE enabled = 1
                ) AS c
                ON (b.no = c.board_no)
                WHERE b.user_no = ?
                AND b.enabled = 1
                ORDER BY b.create_datetime DESC
                LIMIT ? OFFSET ?
            `, [user_no, Number(count), Number(page * count)]
            );

            results1.map((result) => result.comments = result.comments === null ? 0 : result.comments)
            utils.formatting_datetime(results1);

            next({ ...results[0], results1 })
        } catch (e) {
            next(e);
        }
    },
    async bestOfBoards(req, res, next) {
        try {
            let category = req.query.category;
            const category_no = req.query.category_no;

            let region_no = null;
            let sector_no = null;

            if (category === 'region') region_no = category_no;
            else if (category == 'sector') sector_no = category_no;

            const [results] = await pool.query(
                `
                SELECT 
                b.no AS 'board_no',
                b.user_no,
                u.nickname,
                b.region_bcode,
                b.sector_no,
                b.title AS 'board_title',
                b.content AS 'board_content',
                b.views,
                b.likes,
                comments,
                b.create_datetime,
                b.update_datetime,
                b.remove_datetime
                FROM boards AS b
                LEFT OUTER JOIN(
                    SELECT COUNT(*) AS 'comments', board_no
                    FROM comments
                    WHERE enabled = 1
                ) AS c
                ON b.no = c.board_no
                LEFT OUTER JOIN users u
                ON u.no = b.user_no
                WHERE b.region_bcode = ?
                OR b.sector_no = ?
                AND b.enabled = 1
                ORDER BY b.likes DESC, b.views DESC
                LIMIT 5;
                `, [region_no, sector_no]
            );

            results.map((result) => result.comments = result.comments === null ? 0 : result.comments)
            utils.formatting_datetime(results);

            next({ results })
        } catch (e) {
            next(e);
        }
    },
    async allOfBoards(req, res, next) {
        try {
            const page = req.query.page;
            const count = req.query.count;
            let category = req.query.category;
            const category_no = req.query.category_no;
            if (page === '' || count === undefined || category === null || category_no === null) next();

            let region_no = null;
            let sector_no = null;

            if (category === 'region') region_no = category_no;
            else if (category == 'sector') sector_no = category_no;

            const [result] = await pool.query(
                `
                SELECT count(*) AS 'total_count'
                FROM boards 
                WHERE region_bcode = ?
                OR sector_no = ?
                AND enabled = 1
                `, [region_no, sector_no,])

            const [results] = await pool.query(
                `
                SELECT 
                b.no AS 'board_no',
                b.user_no,
                u.nickname,
                b.region_bcode,
                b.sector_no,
                b.title AS 'board_title',
                b.content AS 'board_content',
                b.views,
                b.likes,
                comments,
                b.create_datetime,
                b.update_datetime,
                b.remove_datetime
                FROM boards AS b
                LEFT OUTER JOIN(
                    SELECT COUNT(*) AS 'comments', board_no
                    FROM comments
                    WHERE enabled = 1
                ) AS c
                ON (b.no = c.board_no)
                LEFT OUTER JOIN users u
                ON u.no = b.user_no
                WHERE b.region_bcode = ?
                OR b.sector_no = ?
                AND b.enabled = 1
                ORDER BY b.create_datetime DESC
                LIMIT ? OFFSET ?
                `,
                [region_no, sector_no, Number(count), Number(page * count)]
            );

            results.map((result) => result.comments = result.comments === null ? 0 : result.comments)
            utils.formatting_datetime(results);

            next({ ...result[0], results })
        } catch (e) {
            next(e);
        }
    },
    async searchedBoards(req, res, next) {
        try {
            const search = req.query.search;
            const page = req.query.page;
            const count = req.query.count;

            const [results] = await pool.query(
                `
                SELECT 
                b.no AS 'board_no',
                b.user_no,
                u.nickname,
                b.region_bcode,
                b.sector_no,
                b.title,
                b.content,
                b.views,
                b.likes,
                comments,
                b.create_datetime,
                b.update_datetime,
                b.remove_datetime
                FROM boards AS b
                LEFT OUTER JOIN(
                    SELECT COUNT(*) AS 'comments', board_no
                    FROM comments
                    WHERE enabled = 1
                ) AS c
                ON (b.no = c.board_no)
                LEFT OUTER JOIN users u
                ON u.no = b.user_no
                WHERE (b.title LIKE ?
                OR b.content LIKE ?)
                AND b.enabled = 1
                ORDER BY b.create_datetime DESC
                LIMIT ? OFFSET ?
                `,
                [`%${search}%`, `%${search}%`, Number(count), Number(page * count)]
            );

            results.map((result) => result.comments = result.comments === null ? 0 : result.comments)
            utils.formatting_datetime(results);
            next({ results })
        } catch (e) {
            next(e);
        }
    },
};

module.exports = controller;
