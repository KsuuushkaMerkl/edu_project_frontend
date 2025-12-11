import axios from 'axios';

const API_URL = import.meta.env.VITE_AUTH_API_URL;


export const apiLogin = async ({email, password}) => {
    // Создаем FormData объект для отправки данных
    const formData = new FormData();
    formData.append("username", email);  // Используем email как username
    formData.append("password", password); // Пароль

    // Отправляем данные как form-data, а не JSON
    const response = await axios.post(`${API_URL}/auth_service/auth/login`, formData, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",  // Указываем правильный тип контента
        },
    });

    return response;
};



export const apiRegister = async ({email, name, role, password}) => {
    const response = await axios.post(`${API_URL}/auth_service/auth/register`, {
        username: email,
        name: name,
        role: role,
        password: password
    });
    return response;
};


export const apiGetMe = async (token) => {
    const response = await axios.get(`${API_URL}/auth_service/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const apiUpdateProfile = async (token, {name, role}) => {
    const response = await axios.put(
        `${API_URL}/auth_service/me`,
        {name, role},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response;
};

export const apiChangePassword = async (token, {old_password, new_password}) => {
    const response = await axios.put(
        `${API_URL}/auth_service/me/password`,
        {old_password, new_password},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response;
};

export const apiDeleteMe = async (token) => {
    const response = await axios.delete(`${API_URL}/auth_service/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};
