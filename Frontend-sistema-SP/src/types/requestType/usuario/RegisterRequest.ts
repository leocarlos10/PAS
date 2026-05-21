
export type rol = "ADMIN" | "USUARIO" | "";

export type RegisterRequest = {
    username: string;
    name: string;
    phone: string;
    password: string;
    role: rol;
}
