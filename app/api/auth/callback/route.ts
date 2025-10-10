// app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stackServerApp } from "@/stack/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone();
  const callbackUrl = url.searchParams.get("callbackUrl");

  console.log("🔄 CALLBACK iniciado. CallbackUrl:", callbackUrl);

  try {
    const cookieStore = await cookies();
    
    // 🔹 Obtener usuario autenticado de Stack directamente
    const user = await stackServerApp.getUser();
    
    if (!user) {
      console.log("❌ No se encontró usuario autenticado en Stack");
      return NextResponse.redirect(new URL("/handler/sign-in?error=no-user", req.url));
    }

    console.log("✅ Usuario de Stack obtenido:", user.id);

    // 🔹 Buscar o crear usuario en tu DB (tabla correcta: perfiles_usuario)
    const { executeQuery } = await import("@/lib/db");
    
    let dbUserRows = await executeQuery(
      "SELECT * FROM perfiles_usuario WHERE neon_auth_user_id = $1",
      [user.id]
    );

    if (dbUserRows.length === 0) {
      console.log("📝 Usuario no existe en DB, creando...");
      
      dbUserRows = await executeQuery(
        `INSERT INTO perfiles_usuario (neon_auth_user_id, nombre, apellidos, telefono, rol, activo) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          user.id, 
          user.displayName || "Usuario", 
          null, // apellidos
          null, // telefono
          "cliente", 
          true
        ]
      );
    }

    const userData = dbUserRows[0];
    console.log("✅ Usuario en DB:", { id: userData.id, rol: userData.rol });

    // 🔹 Crear tu propio JWT con los datos del usuario
    const token = jwt.sign(
      {
        id: userData.id, // ← IMPORTANTE: Cambiar userId → id para que coincida con lib/auth.ts
        neonAuthUserId: user.id,
        email: user.primaryEmail,
        rol: userData.rol,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 🔹 Determinar redirección
    let redirectUrl = "/cliente";
    
    if (userData.rol === "admin") {
      redirectUrl = "/admin";
    } else if (callbackUrl && callbackUrl.startsWith("/")) {
      redirectUrl = callbackUrl;
    }

    console.log("🎯 Redirigiendo a:", redirectUrl);

    // 🔹 Crear respuesta y establecer cookie
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // 🔹 Limpiar cookies temporales
    response.cookies.delete("auth-callback-url");

    return response;

  } catch (error: any) {
    console.error("❌ Error en callback:", error.message || error);
    console.error("Stack trace:", error.stack);
    
    // 🔹 PREVENIR BUCLE: Borrar stack-access si falla la autenticación
    const errorResponse = NextResponse.redirect(
      new URL("/handler/sign-in?error=auth-failed", req.url)
    );
    
    // ⚠️ CRÍTICO: Eliminar stack-access para romper el bucle
    errorResponse.cookies.delete("stack-access");
    errorResponse.cookies.delete("auth-callback-url");
    
    return errorResponse;
  }
}