const baseUrl = "https://localhost:7001"; // ret til din backend-URL

// ASP.NET bruger lange claim-navne når man bruger ClaimTypes.Name / ClaimTypes.Role
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

Vue.createApp({
    data() {
        return {
            records: [],
            username: "",
            password: "",
            token: null,
            currentUser: "",
            roles: [],
            loginError: ""
        };
    },
    computed: {
        isAdmin() {
            return this.token !== null && this.roles.includes("Admin");
        }
    },
    mounted() {
        // Bevar login ved reload
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            this.setToken(savedToken);
        }
        this.getAllRecords();
    },
    methods: {
        getAllRecords() {
            this.records = [
                { id: 1, title: "Abbey Road", artist: "The Beatles", duration: 2832, publicationYear: 1969 },
                { id: 2, title: "Thriller", artist: "Michael Jackson", duration: 2537, publicationYear: 1982 },
                { id: 3, title: "Rumours", artist: "Fleetwood Mac", duration: 2400, publicationYear: 1977 }
            ];
        },

        async login() {
            this.loginError = "";
            try {
                const response = await axios.post(`${baseUrl}/api/auth/login`, {
                    username: this.username,
                    password: this.password
                });
                // Understøtter både { token: "..." } og en rå string
                const token = response.data.token ?? response.data;
                this.setToken(token);
                this.password = "";
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    this.loginError = "Forkert brugernavn eller adgangskode";
                } else {
                    this.loginError = "Kunne ikke kontakte serveren";
                }
            }
        },

        logout() {
            localStorage.removeItem("token");
            delete axios.defaults.headers.common["Authorization"];
            this.token = null;
            this.currentUser = "";
            this.roles = [];
            this.username = "";
        },

        setToken(token) {
            const payload = this.parseJwt(token);

            // Udløbet token → log ud med det samme
            if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
                this.logout();
                return;
            }

            this.token = token;
            localStorage.setItem("token", token);
            // Sendes automatisk med alle fremtidige requests (tilføj/slet/ret)
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            this.currentUser = payload[NAME_CLAIM] ?? payload.unique_name ?? payload.name ?? "";
            const roles = payload[ROLE_CLAIM] ?? payload.role ?? [];
            this.roles = Array.isArray(roles) ? roles : [roles];
        },

        parseJwt(token) {
            try {
                // JWT = header.payload.signatur – payload er base64url-kodet JSON
                const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
                const json = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                );
                return JSON.parse(json);
            } catch {
                return null;
            }
        }
    }
}).mount("#app");