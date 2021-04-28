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
            const [ result ] = await pool.query(`
            SELECT *
            FROM users
            WHERE no = ?
            AND enabled = 1
            `, [ user_no ])

            let region_no = null
            let sector_no = null

            const [ result1 ] = await pool.query(`
            SELECT 
            COUNT(*) AS 'count'
            FROM boards
            WHERE title = ?
            AND enabled = 1
            `, [ title ])
            if (result1[0].count > 0) res.json({ message: "동일한 제목의 게시글이 존재합니다." })
            else {
                if (category === 'region'){
                    region_no = result[0].region_no
                } else if (category == 'sector') {
                    sector_no = result[0].sector_no
                }
        
                const connection = await pool.getConnection(async conn => conn)
                try {
                    await connection.beginTransaction()
                    await connection.query(`
                    INSERT INTO 
                    boards(user_no, title, content, region_no, sector_no)
                    VALUE (?, ?, ?, ?, ?);
                    `, [ user_no, title, content, region_no, sector_no ])
                    await connection.commit()
    
                    next(
                        res.json({
                            code: 200,
                            success: '게시글이 정상적으로 등록되었습니다.'
                        })
                    )
                } catch(e) {
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
    async AllOfBoards(req, res, next){
        try {
            let region_no = null
            let sector_no = null
        
            const page = req.query.page
            const count = req.query.count
            let category = req.query.category

            if (category === 'region'){
                region_no = req.users.region_no
            } else if (category == 'sector') {
                sector_no = req.users.sector_no
            }

            const [ results ] = await pool.query(`
            SELECT *
            FROM boards
            WHERE region_no = ?
            OR sector_no = ?
            AND enabled = 1
            LIMIT ? OFFSET ? 
            `, [ region_no, sector_no, Number(count), Number(page*count) ])
            
            res.json({
                results
            })
        }
        catch(e){
            next(e)
        }
    }
};

module.exports = controller;
