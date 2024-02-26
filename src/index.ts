import { plainToClass } from "class-transformer";
import { validateOrReject } from "class-validator";
import dotenv from "dotenv";
import "es6-shim";
import express, { Express, Request, Response } from "express";
import { Pool } from "pg";
import "reflect-metadata";
import { Board } from "./dto/board.dto";
import { User } from "./dto/user.dto";
import { List } from "./dto/list.dto";
import { Card } from "./dto/card.dto"; 
import { CardUser } from "./dto/card_user.dto";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: +process.env.DB_PORT!,
});

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/users", async (req: Request, res: Response) => {
  try {
    const text = "SELECT id, name, email FROM users";
    const result = await pool.query(text);
    res.status(200).json(result.rows);
  } catch (errors) {
    return res.status(400).json(errors);
  }
});

app.post("/users", async (req: Request, res: Response) => {
  let userDto: User = plainToClass(User, req.body);
  try {
    await validateOrReject(userDto);

    const text = "INSERT INTO users(name, email) VALUES($1, $2) RETURNING *";
    const values = [userDto.name, userDto.email];
    const result = await pool.query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (errors) {
    return res.status(422).json(errors);
  }
});

app.get("/boards", async (req: Request, res: Response) => {
  try {
    const text =
      'SELECT b.id, b.name, bu.userId "adminUserId" FROM boards b JOIN board_users bu ON bu.boardId = b.id WHERE bu.isAdmin IS true';
    const result = await pool.query(text);
    res.status(200).json(result.rows);
  } catch (errors) {
    return res.status(400).json(errors);
  }
});

app.post("/boards", async (req: Request, res: Response) => {
  let boardDto: Board = plainToClass(Board, req.body);
  const client = await pool.connect();
  try {
    client.query("BEGIN");
    await validateOrReject(boardDto, {});

    const boardText = "INSERT INTO boards(name) VALUES($1) RETURNING *";
    const boardValues = [boardDto.name];
    const boardResult = await client.query(boardText, boardValues);

    const boardUserText =
      "INSERT INTO board_users(boardId, userId, isAdmin) VALUES($1, $2, $3)";
    const boardUserValues = [
      boardResult.rows[0].id,
      boardDto.adminUserId,
      true,
    ];
    await client.query(boardUserText, boardUserValues);

    client.query("COMMIT");
    res.status(201).json(boardResult.rows[0]);
  } catch (errors) {
    client.query("ROLLBACK");
    return res.status(422).json(errors);
  } finally {
    client.release();
  }
});
app.get("/lists", async (req: Request, res: Response) => {
  try {
    const text = "SELECT id, name, boardId FROM lists";
    const result = await pool.query(text);
    res.status(200).json(result.rows);
  } catch (errors) {
    res.status(400).json(errors);
  }
});
app.post("/lists", async (req: Request, res: Response) => {
  let listDto: List = plainToClass(List, req.body);
  try {
    await validateOrReject(listDto);
    const text = "INSERT INTO lists(name, boardId) VALUES($1, $2) RETURNING *";
    const values = [listDto.name, listDto.boardId];
    const result = await pool.query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (errors) {
    res.status(422).json(errors);
  }
});
app.get("/cards", async (req: Request, res: Response) => {
  try {
    const text = "SELECT id, title, description, due_date, listId FROM cards";
    const result = await pool.query(text);
    res.status(200).json(result.rows);
  } catch (errors) {
    res.status(400).json(errors);
  }
});


app.post("/cards", async (req: Request, res: Response) => {
  let cardDto: Card = plainToClass(Card, req.body);
  try {
    await validateOrReject(cardDto);

    const text = "INSERT INTO cards(title, description, due_date, listId) VALUES($1, $2, $3, $4) RETURNING *";
    const values = [cardDto.title, cardDto.description, cardDto.due_date, cardDto.listId];
    const result = await pool.query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (errors) {
    res.status(422).json(errors);
  }
});

// Endpoint para asignar un usuario a una tarjeta
app.post("/card-users", async (req: Request, res: Response) => {
  let cardUserDto: CardUser = plainToClass(CardUser, req.body);
  try {
    await validateOrReject(cardUserDto);

    const text = "INSERT INTO card_users(cardId, userId, isOwner) VALUES($1, $2, $3) RETURNING *";
    const values = [cardUserDto.cardId, cardUserDto.userId, cardUserDto.isOwner];
    const result = await pool.query(text, values);
    res.status(201).json(result.rows[0]);
  } catch (errors) {
    res.status(422).json(errors);
  }
});
app.get("/cards/:cardId/users", async (req: Request, res: Response) => {
  const { cardId } = req.params;
  try {
    const text = "SELECT u.id, u.name, u.email, cu.isOwner FROM users u JOIN card_users cu ON cu.userId = u.id WHERE cu.cardId = $1";
    const values = [cardId];
    const result = await pool.query(text, values);
    res.status(200).json(result.rows);
  } catch (errors) {
    res.status(400).json(errors);
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
