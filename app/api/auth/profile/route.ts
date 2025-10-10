// app/api/auth/profile/route.ts

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { id: number };

        const userResult = await executeQuery(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1 AND activo = TRUE',
            [decoded.id]
        );

        if (userResult.length === 0) {
            return NextResponse.json({ message: 'Usuario no encontrado o inactivo' }, { status: 404 });
        }

        return NextResponse.json(userResult[0]);
        
    } catch (error) {
        return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
    }
}