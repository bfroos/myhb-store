<template>
  <UiLayoutSectionBlock>
    <div v-if="articles.length > 0" class="blogPageArticles">
      <UiMoleculeBlogArticleTeaser
        v-for="article in articles"
        :key="article.id"
        :slug="article.slug"
        :headline="article.headline"
        :intro="article.intro"
        :displayDate="article.displayDate"
        :cover="article.cover"
        :category="article.category"
      />
    </div>
    <BaseEmptyState
      v-else
      :title="$t('blog.emptyState.title')"
      :description="$t('blog.emptyState.description')"
      inline
    />
    <Paginator
      v-if="pagination && articles.length > 0"
      v-model:first="first"
      :rows="pagination.pageSize"
      :total-records="pagination.total"
      :dt="paginatorTokens"
      @page="onPageChange"
      class="blogPageArticles__paginator"
    />
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import Paginator from "primevue/paginator";
import type { BlogArticleDto } from "~/lib/strapi/dto/collections";

const props = defineProps<{
  articles: BlogArticleDto[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
}>();

const emit = defineEmits<{
  pageChange: [page: number];
}>();

const first = computed({
  get: () => {
    if (!props.pagination) return 0;
    return (props.pagination.page - 1) * props.pagination.pageSize;
  },
  set: () => {},
});

const onPageChange = (event: any) => {
  const newPage = Math.floor(event.first / event.rows) + 1;
  emit("pageChange", newPage);
};

// Design Tokens für den Paginator anpassen
const paginatorTokens = ref({
  root: {
    borderRadius: "var(--border-radius-card)",
    background: "var(--color-card-bg-strong)",
  },
  navButton: {
    color: "var(--color-white)",
    hover: {
      color: "var(--color-white)",
      background: "var(--color-gray-800)",
    },
    selected: {
      color: "var(--color-white)",
      background: "var(--color-gray-800)",
    },
  },
  pageButton: {
    borderRadius: "var(--border-radius-400)",
    padding: "var(--space-200) var(--space-400)",
    focusRing: {
      width: "2px",
      style: "solid",
      color: "var(--color-primary)",
      offset: "2px",
      offsetWidth: "2px",
    },
  },
  firstPageButton: {
    borderRadius: "var(--border-radius-400)",
    padding: "var(--space-200) var(--space-400)",
  },
  prevPageButton: {
    borderRadius: "var(--border-radius-400)",
    padding: "var(--space-200) var(--space-400)",
  },
  nextPageButton: {
    borderRadius: "var(--border-radius-400)",
    padding: "var(--space-200) var(--space-400)",
  },
  lastPageButton: {
    borderRadius: "var(--border-radius-400)",
    padding: "var(--space-200) var(--space-400)",
  },
  rowsPerPageDropdown: {
    root: {
      borderRadius: "var(--border-radius-400)",
    },
  },
});
</script>
<style scoped>
.blogPageArticles {
  display: grid;
  gap: var(--space-600);
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  margin-bottom: var(--space-600);
}

.blogPageArticles__paginator {
  margin-top: var(--space-600);
}
</style>
