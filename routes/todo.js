const express = require('express');
const mongoose = require('mongoose');
const Todo = require('../models/Todo');
const authenticateToken = require('./middleware');
const router = express.Router();

// Create a new Todo
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const newTodo = new Todo({
            title,
            user: req.user.id
        });

        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error Creating Todo" });
    }
});

// Get all Todos for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });

        if (todos.length === 0) {
            return res.status(404).json({ message: "No Todos Found" });
        }

        res.json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error Fetching Todos" });
    }
});
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });

        if (!todo) {
            return res.status(404).json({ message: "Todo Not Found" });
        }

        res.json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error Fetching Todo" });
    }
});
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        
        const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
        if (!todo) {
            return res.status(404).json({ error: "Todo not found" });
        }

        todo.title = req.body.title;
        todo.completed = req.body.completed;

        await todo.save();
        res.json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error Updating Todo" });
    }
});


router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const todoId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(todoId)) {
            return res.status(400).json({ error: "Invalid Todo ID format" });
        }

        const todo = await Todo.findOne({ _id: todoId, user: req.user.id });

        if (!todo) {
            return res.status(404).json({ error: "Todo not found or does not belong to the user" });
        }

        //  Delete the todo
        await Todo.deleteOne({ _id: todoId });

        res.json({ message: "Todo deleted successfully" });
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Error deleting todo" });
    }
});

  
module.exports = router;
