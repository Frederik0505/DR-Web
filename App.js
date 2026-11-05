axios.defaults.baseURL = window.DR_API_BASE_URL;

const savedToken = sessionStorage.getItem("drJwt");
if (savedToken) axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;

const emptyRecord = () => ({ title: "", artist: "", duration: 1, publicationYear: new Date().getFullYear() });

Vue.createApp({
    data() {
        return {
            records: [],
            loginForm: { username: "", password: "" },
            token: savedToken || "",
            isAdmin: sessionStorage.getItem("drIsAdmin") === "true",
            username: sessionStorage.getItem("drUsername") || "",
            editingRecord: null,
            loading: false,
            saving: false,
            errorMessage: "",
            successMessage: "",
            searchTitle: "",
            searchArtist: "",
            searched: false,
            newRecord: emptyRecord()
        };
    },

    mounted() {
        this.getRecords();
    },

    methods: {
        clearMessages() {
            this.errorMessage = "";
            this.successMessage = "";
        },
        errorText(error) {
            if (!error.response) return "Kunne ikke kontakte API'et.";
            if (typeof error.response.data === "string") return error.response.data;
            return `Fejl (${error.response.status})`;
        },
        async getRecords() {
            this.loading = true;
            try {
                // Empty search fields are left out by axios, so this also gets all records.
                const params = { title: this.searchTitle || undefined, artist: this.searchArtist || undefined };
                const response = await axios.get("/api/musicrecords", { params });
                this.records = response.data;
            } catch (error) {
                this.records = [];
                this.errorMessage = this.errorText(error);
            } finally {
                this.loading = false;
            }
        },
        search() {
            this.clearMessages();
            this.searched = true;
            this.getRecords();
        },
        clearSearch() {
            this.searchTitle = "";
            this.searchArtist = "";
            this.searched = false;
            this.getRecords();
        },
        async addRecord() {
            this.clearMessages();
            try {
                await axios.post("/api/musicrecords", this.newRecord);
                this.newRecord = emptyRecord();
                this.successMessage = "Pladen er tilføjet!";
                await this.getRecords();
            } catch (error) {
                this.errorMessage = this.errorText(error);
            }
        },
        async deleteRecord(id) {
            if (!confirm("Er du sikker på, at du vil slette denne plade?")) return;
            this.clearMessages();
            try {
                await axios.delete(`/api/musicrecords/${id}`);
                this.successMessage = "Pladen er slettet.";
                await this.getRecords();
            } catch (error) {
                this.errorMessage = this.errorText(error);
            }
        },
        async login() {
            this.clearMessages();
            try {
                const response = await axios.post("/api/auth/login", this.loginForm);
                this.token = response.data.token;
                axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
                // Login only returns the token; ask the API who we are.
                const me = await axios.get("/api/auth/me");
                this.isAdmin = me.data.roles.includes("Administrator");
                this.username = me.data.username;
                sessionStorage.setItem("drJwt", this.token);
                sessionStorage.setItem("drIsAdmin", this.isAdmin);
                sessionStorage.setItem("drUsername", this.username);
                this.loginForm.password = "";
                this.successMessage = "Du er logget ind.";
            } catch (error) {
                this.token = "";
                delete axios.defaults.headers.common.Authorization;
                this.errorMessage = this.errorText(error);
            }
        },
        logout() {
            sessionStorage.clear();
            delete axios.defaults.headers.common.Authorization;
            this.token = "";
            this.isAdmin = false;
            this.username = "";
            this.editingRecord = null;
            this.clearMessages();
            this.successMessage = "Du er logget ud.";
        },
        startEdit(record) {
            this.clearMessages();
            this.editingRecord = { ...record }; // Copy: don't alter table before PUT succeeds.
        },
        cancelEdit() {
            this.editingRecord = null;
        },
        async saveEdit() {
            this.clearMessages();
            this.saving = true;
            try {
                await axios.put(`/api/musicrecords/${this.editingRecord.id}`, this.editingRecord);
                this.editingRecord = null;
                this.successMessage = "Pladen er opdateret i listen.";
                await this.getRecords();
            } catch (error) {
                this.errorMessage = this.errorText(error);
            } finally {
                this.saving = false;
            }
        }
    }
}).mount("#app");
