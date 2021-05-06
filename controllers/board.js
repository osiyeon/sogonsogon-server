const mysql = require('mysql2/promise');
const dbconfig = require('../config/index').mysql;
const pool = mysql.createPool(dbconfig);

const utils = require('../utils')

const controller = {
    async createBoard(req, res, next) {
        try {
            const user_no = req.users.user_no
            const title = req.body.title
            const content = req.body.content
            const category = req.body.category
            const category_no = req.body.category_no

            const [result1] = await pool.query(`
            SELECT 
            COUNT(*) AS 'count'
            FROM boards
            WHERE title = ?
            AND enabled = 1
            `, [title])
            let region_no = null
            let sector_no = null

            if (category === 'region') {
                region_no = category_no
            } else if (category == 'sector') {
                sector_no = category_no
            }

            const connection = await pool.getConnection(async conn => conn)
            try {
                await connection.beginTransaction()
                await connection.query(`
                INSERT INTO 
                boards(user_no, title, content, region_no, sector_no)
                VALUE (?, ?, ?, ?, ?);
                `, [user_no, title, content, region_no, sector_no])
                await connection.commit()

                res.json({
                    code: 200,
                    success: '게시글이 정상적으로 등록되었습니다.'
                })
            } catch (e) {
                await connection.rollback()
                next(e)
            } finally {
                connection.release()
            }
        } catch (e) {
            next(e)
        }
    },
    async editBoard(req, res, next) {
        try {
            const board_no = req.body.board_no
            const title = req.body.title
            const content = req.body.content
            const category = req.body.category
            const category_no = req.body.category_no

            const [result] = await pool.query(`
            SELECT *
            FROM boards
            WHERE no = ?
            AND enabled = 1;
            `, [board_no])

            if (result.length < 1) res.json({ message: `게시글이 존재하지 않습니다.` })
            else {
                const connection = await pool.getConnection(async conn => conn)
                try {
                    await connection.beginTransaction()

                    let region_no = null
                    let sector_no = null

                    if (category === 'region') {
                        region_no = category_no
                    } else if (category == 'sector') {
                        sector_no = category_no
                    }

                    await connection.query(`
                    UPDATE boards
                    SET 
                    title = ?,
                    content = ?,
                    region_no = ?,
                    sector_no = ?
                    WHERE no = ?
                    AND enabled = 1;
                    `, [title, content, region_no, sector_no, board_no])

                    await connection.commit()
                    res.json({ message: `게시글이 변경되었습니다.` })

                } catch (e) {
                    await connection.rollback()
                    next(e)
                } finally {
                    connection.release()
                }
            }
        } catch (e) {
            next(e)
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

            if (result1[0].count < 1) res.json({ message: '게시글이 존재하지 않습니다.' });

            const connection = await pool.getConnection(async (conn) => conn);
            try {
                await connection.beginTransaction();
                await connection.query(`
                UPDATE boards t1
                RIGHT JOIN comments t2 ON(t2.board_no = t1.no)
                SET
                t1.remove_datetime = NOW(),
                t2.remove_datetime = NOW(),
                t1.enabled = 0,
                t2.enabled = 0
                WHERE t1.no = ?
                AND t1.user_no = ?
            `,
                    [board_no, user_no]
                );
                await connection.commit();
                res.json({
                    message: '게시글이 정상적으로 삭제되었습니다.',
                });
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
            const user_no = req.users.user_no
            const board_no = req.query.board_no
            const [result] = await pool.query(`
            SELECT *
            FROM boards
            WHERE no = ?
            AND enabled = 1;
            `, [board_no])

            if (result.length < 1) res.json({ message: `게시글이 존재하지 않습니다.` })
            else {
                const connection = await pool.getConnection(async conn => conn)
                try {
                    await connection.beginTransaction()
                    await connection.query(`
                    UPDATE boards
                    SET 
                    views = IFNULL(views, 0) + 1
                    WHERE no = ?
                    AND enabled = 1;
                    `, [board_no])

                    const [result1] = await connection.query(`
                    SELECT *
                    FROM boards
                    WHERE no = ?
                    AND enabled = 1
                    `, [board_no])

                    const is_mine = user_no === result1[0].user_no ? true : false
                    utils.formatting_datetime(result1)

                    await connection.commit()
                    res.json({
                        is_mine: is_mine,
                        board: result1[0]
                    })

                } catch (e) {
                    await connection.rollback()
                    next(e)
                } finally {
                    connection.release()
                }
            }
        } catch (e) {
            next(e)
        }
    },
    async like(req, res, next) {
        try {
            const board_no = req.query.board_no
            const [result] = await pool.query(`
            SELECT *
            FROM boards
            WHERE no = ?
            AND enabled = 1;
            `, [board_no])

            if (result.length < 1) res.json({ message: `게시글이 존재하지 않습니다.` })
            else {
                const connection = await pool.getConnection(async conn => conn)
                try {
                    await connection.beginTransaction()
                    await connection.query(`
                    UPDATE boards
                    SET 
                    likes = IFNULL(likes, 0) + 1
                    WHERE no = ?
                    AND enabled = 1;
                    `, [board_no])

                    await connection.commit()
                    res.json({ message: `좋아요 완료` })

                } catch (e) {
                    await connection.rollback()
                    next(e)
                } finally {
                    connection.release()
                }
            }


        } catch (e) {
            next(e)
        }
    },
    async myBoards(req, res, next) {
        try {
            const user_no = req.users.user_no
            const count = req.query.count
            const page = req.query.page
            const [results] = await pool.query(`
            SELECT *
            FROM boards
            WHERE user_no = ?
            AND enabled = 1
            ORDER BY create_datetime DESC
            LIMIT ? OFFSET ? 
            `, [user_no, Number(count), Number(page * count)])

            utils.formatting_datetime(results)

            res.json(results)

        } catch (e) {

        }
    },
    async bestOfBoards(req, res, next) {
        try {
            let category = req.query.category
            const category_no = req.query.category_no

            let region_no = null
            let sector_no = null

            if (category === 'region') {
                region_no = category_no
            } else if (category == 'sector') {
                sector_no = category_no
            }

            const [results] = await pool.query(`
            SELECT *
            FROM boards
            WHERE region_no = ?
            OR sector_no = ?
            AND enabled = 1
            ORDER BY likes DESC, views DESC
            LIMIT 5; 
            `, [region_no, sector_no])

            utils.formatting_datetime(results)

            res.json({
                boards: results
            })
        }
        catch (e) {
            next(e)
        }
    },
    async allOfBoards(req, res, next) {
        try {
            const page = req.query.page
            const count = req.query.count
            let category = req.query.category
            const category_no = req.query.category_no
            if (page === '' || count === undefined || category === null || category_no === null) next();

            let region_no = null
            let sector_no = null

            if (category === 'region') {
                region_no = category_no
            } else if (category == 'sector') {
                sector_no = category_no
            }

            const [results] = await pool.query(`
            SELECT *
            FROM boards
            WHERE region_no = ?
            OR sector_no = ?
            AND enabled = 1
            ORDER BY create_datetime DESC
            LIMIT ? OFFSET ? 
            `, [region_no, sector_no, Number(count), Number(page * count)])

            utils.formatting_datetime(results)

            res.json({
                boards: results
            })
        }
        catch (e) {
            next(e)
        }
    },
    async searchedBoards(req, res, next) {
        try {
            const search = req.query.search
            const page = req.query.page
            const count = req.query.count

            const [results] = await pool.query(`
            SELECT *
            FROM boards
            WHERE title LIKE ?
            OR content LIKE ?
            AND enabled = 1
            ORDER BY create_datetime DESC
            LIMIT ? OFFSET ? 
            `, [`%${search}%`, `%${search}%`, Number(count), Number(page * count)])

            utils.formatting_datetime(results)

            res.json(results)

        } catch (e) {
            next(e)
        }
    }
};

module.exports = controller;
