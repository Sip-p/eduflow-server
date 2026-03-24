import request from 'supertest'
import app from '../index'
import mongoose from 'mongoose'

describe('Auth Routes', () => {

  // Test registration
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
  })

  // Test login
  it('should login existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })

  // Test wrong password
  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

    expect(res.statusCode).toBe(401)
  })
})
