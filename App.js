Vue.createApp({
    data() {
        return {
            records: [],
            message: ""
        };
    },

    mounted() {
        this.getAllRecords();
    },

    methods: {
        async getAllRecords() {
            try {
                const response = await axios.get(
                    "http://localhost:5102/api/MusicRecords"
                );

                this.records = response.data;
            } catch (error) {
                console.error("Fejl ved hentning af plader:", error);
                this.message = "Kunne ikke hente plader.";
            }
        },

        async deleteRecord(id) {
            const confirmed = confirm(
                "Er du sikker på, at du vil slette denne plade?"
            );

            if (!confirmed) {
                return;
            }

            try {
                await axios.delete(
                    "http://localhost:5102/api/MusicRecords/" + id
                );

                this.message = "Pladen er slettet.";
                await this.getAllRecords();

            } catch (error) {
                console.error("Fejl ved sletning:", error);
                this.message = "Kunne ikke slette pladen.";
            }
        }
    }
}).mount("#app");