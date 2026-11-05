Vue.createApp({
    data() {
        return {
            records: [],
            loginForm: { username: "", password: "" },
            token: sessionStorage.getItem("drJwt") || "",
            role: sessionStorage.getItem("drRole") || "",
            username: sessionStorage.getItem("drUsername") || "",
            editingRecord: null,
            loading: false,
            saving: false,
            errorMessage: "",
            successMessage: ""
        };
    },
    computed: {
        isAdministrator() {
            return !!this.token && this.role === "Administrator";
        }
    },
    mounted() {
        this.getAllRecords();
    },
    methods: {
        apiUrl(path) {
            const base = (window.DR_API_BASE_URL || "http://localhost:5102").replace(/\/$/, "");
            return `${base}${path}`;
        },
        clearMessages() {
            this.errorMessage = "";
            this.successMessage = "";
        },
        errorText(error) {
            if (!error.response) return "Kunne ikke kontakte API'et. Kontrollér backend, CORS og URL i config.js.";
            const data = error.response.data;
            if (data?.message) return data.message;
            if (data?.errors) return Object.values(data.errors).flat().join(" ");
            if (error.response.status === 401) return "Ikke logget ind, eller token er udløbet.";
            if (error.response.status === 403) return "Du har ikke administratorrettigheder.";
            if (error.response.status === 404) return "Pladen findes ikke længere.";
            return `API-fejl (${error.response.status}).`;
        },
        async getAllRecords() {
            this.loading = true;
            try {
                const response = await axios.get(this.apiUrl("/api/musicrecords"));
                this.records = response.data;
            } catch (error) {
                this.errorMessage = this.errorText(error);
            } finally {
                this.loading = false;
            }
        },
        async login() {
            this.clearMessages();
            try {
                const response = await axios.post(this.apiUrl("/api/auth/login"), this.loginForm);
                this.token = response.data.token;
                this.role = response.data.roles.includes("Administrator") ? "Administrator" : "User";
                this.username = response.data.username;
                sessionStorage.setItem("drJwt", this.token);
                sessionStorage.setItem("drRole", this.role);
                sessionStorage.setItem("drUsername", this.username);
                this.loginForm.password = "";
                this.successMessage = "Du er logget ind.";
            } catch (error) {
                this.errorMessage = this.errorText(error);
            }
        },
        logout() {
            sessionStorage.removeItem("drJwt");
            sessionStorage.removeItem("drRole");
            sessionStorage.removeItem("drUsername");
            this.token = "";
            this.role = "";
            this.username = "";
            this.editingRecord = null;
            this.clearMessages();
            this.successMessage = "Du er logget ud.";
        },
        startEdit(record) {
            if (!this.isAdministrator) return;
            this.clearMessages();
            this.editingRecord = { ...record }; // Copy: don't alter table before PUT succeeds.
        },
        cancelEdit() {
            this.editingRecord = null;
        },
        async saveEdit() {
            if (!this.isAdministrator || !this.editingRecord || this.saving) return;
            this.clearMessages();
            this.saving = true;
            const changed = { ...this.editingRecord };
            try {
                await axios.put(
                    this.apiUrl(`/api/musicrecords/${changed.id}`),
                    changed,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
                this.editingRecord = null;
                await this.getAllRecords();
                if (!this.errorMessage) this.successMessage = "Pladen er opdateret i listen.";
            } catch (error) {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    this.logout();
                }
                this.errorMessage = this.errorText(error);
            } finally {
                this.saving = false;
            }
        }
    }
}).mount("#app");
