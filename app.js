export const buildPexelsEndpoint = ({
  baseUrl = "https://api.pexels.com/v1",
  searchTerm,
  perPage,
  page,
}) => {
  const params = new URLSearchParams({
    per_page: perPage,
    page,
    ...(searchTerm ? { query: searchTerm } : {}),
  });
  const path = searchTerm ? "search" : "curated";
  return `${baseUrl}/${path}?${params.toString()}`;
};

export const getPexelsErrorMessage = (status) => {
  if (status === 401 || status === 403) {
    return "Pexels API authorization error. Check your API key.";
  }
  if (status === 429) {
    return "Pexels API rate limit reached. Try again later.";
  }
  if (status >= 500) {
    return "Pexels is temporarily unavailable. Try again later.";
  }
  return `Failed to load photos (status ${status}).`;
};

if (typeof window !== "undefined" && window.Vue) {
  const { createApp } = window.Vue;

  createApp({
    data() {
      return {
        apiKey: "TE8RABHj5SDoph4VVnDYGbC7ewmo9GEJcvlkd4S633p6iWbb651u1vFF",
        photos: [],
        page: 1,
        perPage: 20,
        isLoading: false,
        error: "",
        searchTerm: "",
        hasMore: true,
        observer: null,
      };
    },
    mounted() {
      this.loadPhotos(true);
      this.observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (!entry || !entry.isIntersecting || this.isLoading) return;
          this.loadPhotos(false);
        },
        { rootMargin: "200px" }
      );
      this.observer.observe(this.$refs.sentinel);
    },
    beforeUnmount() {
      if (this.observer) {
        this.observer.disconnect();
      }
    },
    methods: {
      async loadPhotos(reset) {
        if (this.isLoading || (!this.hasMore && !reset)) return;
        this.isLoading = true;
        this.error = "";
        if (reset) {
          this.page = 1;
          this.hasMore = true;
          this.photos = [];
        }

        const endpoint = buildPexelsEndpoint({
          searchTerm: this.searchTerm,
          perPage: this.perPage,
          page: this.page,
        });

        try {
          const response = await fetch(endpoint, {
            headers: { Authorization: this.apiKey },
          });

          if (!response.ok) {
            throw new Error(getPexelsErrorMessage(response.status));
          }

          const data = await response.json();
          const incoming = data.photos || [];
          this.photos = reset ? incoming : [...this.photos, ...incoming];
          this.hasMore = Boolean(data.next_page);
          this.page += 1;
        } catch (error) {
          this.error = error.message || "Failed to load.";
        } finally {
          this.isLoading = false;
        }
      },
      handleSearch() {
        this.loadPhotos(true);
      },
      resetSearch() {
        this.searchTerm = "";
        this.loadPhotos(true);
      },
    },
  }).mount("#app");
}
