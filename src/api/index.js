import axios from 'axios'
import store from "../store";
import router from "../router";

const baseUrl = process.env.VUE_APP_BASE_URL;

export const apiAxios = axios.create({
    baseURL: `${baseUrl}/api`,
    headers: {
        post: {
            'Content-Type': 'application/json'
        }
    }
})

apiAxios.interceptors.request.use(config => {
    let token = store.state.auth.accessToken
    if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`
    }
    return config
}, error => {
    return Promise.reject(error)
})

apiAxios.interceptors.response.use(undefined, (error) => {
    if (error) {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry && router.currentRoute.name !== 'Login') {
            store.commit('auth/updateLoginStatus', false)
            store.commit('auth/updateAuthUser', {})
            store.commit('auth/updateAccessToken', '')
            return router.push({name: 'Login'})
        }
    }
    return Promise.reject(error);
})

apiAxios.interceptors.response.use(undefined, error => {
    if (error) {
        if (error.response.status === 403) {
            if (
                error.response.data.error.error_permission &&
                error.response.data.error.error_permission.length > 0
            ) {
                return router.push({ name: 'Home', params: { errorPermission: "true" } });
            }
        }
    }
    return Promise.reject(error);
});

export default {
    login(data) {
        return apiAxios({
            method: 'post',
            url: '/admins/auth/login',
            data: data
        })
    },
    getAuthUser() {
        return apiAxios({
            method: 'get',
            url: 'admins/auth/me'
        })
    },
    getEmployee(data) {
        return apiAxios({
            method: 'get',
            url: 'admins/employees',
            params: data
        })
    },
    getAllRoles() {
        return apiAxios({
            method: 'get',
            url: 'admins/roles/all',
        })
    },
    addEmployee(data) {
        return apiAxios({
            method: 'post',
            url: 'admins/employees',
            data: data
        })
    },
    deleteEmployee(id) {
        return apiAxios({
            method: 'delete',
            url: 'admins/employees/' + id,
        })
    },
    updateEmployee(data, id) {
        return apiAxios({
            method: 'post',
            url: 'admins/employees/' + id,
            data: data
        })
    },
}
