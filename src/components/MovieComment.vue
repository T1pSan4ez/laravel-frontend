<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import ApiService from "@/services/api";

const props = defineProps({
  currentUser: {
    type: Object,
    default: null,
  },
});

const route = useRoute();
const comments = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const commentsError = ref(null);
const isLoadingComments = ref(false);
const newComment = ref("");
const isSubmitting = ref(false);
const validationError = ref(null);
const showModal = ref(false);
const commentToDelete = ref(null);

const fetchComments = async (page = 1) => {
  try {
    isLoadingComments.value = true;
    const movieId = route.params.id;

    const params = { page };

    const response = await ApiService.getMovieComments(movieId, { params });

    comments.value = response.data;
    totalPages.value = response.meta.last_page;
    currentPage.value = response.meta.current_page;
  } catch (err) {
    console.error("Error fetching comments:", err);
    commentsError.value = "Failed to load comments. Please try again.";
  } finally {
    isLoadingComments.value = false;
  }
};

const validateComment = () => {
  if (!newComment.value.trim()) {
    validationError.value = "Comment cannot be empty.";
    return false;
  }
  if (newComment.value.length > 1000) {
    validationError.value = "Comment cannot exceed 1000 characters.";
    return false;
  }
  validationError.value = null;
  return true;
};

const postComment = async () => {
  if (!validateComment()) return;

  isSubmitting.value = true;
  try {
    const movieId = route.params.id;
    await ApiService.addMovieComment(movieId, {
      content: newComment.value.trim(),
    });

    await fetchComments(currentPage.value);

    newComment.value = "";
  } catch (err) {
    console.error("Error posting comment:", err);
    commentsError.value = "Failed to post comment. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDeleteComment = (commentId) => {
  commentToDelete.value = commentId;
  showModal.value = true;
};

const deleteComment = async () => {
  try {
    await ApiService.deleteMovieComment(commentToDelete.value);
    comments.value = comments.value.filter((comment) => comment.id !== commentToDelete.value);
    commentToDelete.value = null;
    showModal.value = false;
    await fetchComments(currentPage.value);
  } catch (err) {
    console.error("Error deleting comment:", err);
    commentsError.value = "Failed to delete comment. Please try again.";
  }
};

const closeModal = () => {
  showModal.value = false;
  commentToDelete.value = null;
};

const changePage = async (page) => {
  if (page !== currentPage.value && page > 0 && page <= totalPages.value) {
    await fetchComments(page);
  }
};

const canDeleteComment = (comment) => {
  if (!props.currentUser) return false;
  return (
    props.currentUser.role === 1 ||
    props.currentUser.id === comment.user.id
  );
};

const generatePagination = () => {
  const maxPagesToShow = 10;
  const pages = [];
  if (totalPages.value <= maxPagesToShow) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage.value - Math.floor(maxPagesToShow / 2));
    const end = Math.min(totalPages.value, start + maxPagesToShow - 1);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages.value) pages.push("...", totalPages.value);
  }
  return pages;
};

onMounted(() => {
  fetchComments();
});
</script>

<template>
  <div class="comments-section mt-4">
    <h4>Comments</h4>

    <form @submit.prevent="postComment" class="mt-3" v-if="currentUser">
      <div class="mb-3">
        <label for="newComment" class="form-label">Write a comment:</label>
        <textarea
          id="newComment"
          class="form-control"
          v-model="newComment"
          rows="3"
          placeholder="Add your comment here..."
        ></textarea>
        <div v-if="validationError" class="text-danger mt-1">
          {{ validationError }}
        </div>
      </div>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? "Posting..." : "Post Comment" }}
      </button>
    </form>

    <div v-if="commentsError" class="alert alert-danger mt-3">
      {{ commentsError }}
    </div>

    <div v-if="comments.length > 0" class="mt-3">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment my-3 p-3 border rounded"
      >
        <p class="mb-1">
          <strong>{{ comment.user.name }}: </strong>
          <small class="text-muted">{{
              new Date(comment.created_at).toLocaleString()
            }}</small>
        </p>
        <div class="row align-items-center">
          <div class="col-11 text-truncate">
            <p class="mb-0 text-wrap">{{ comment.content }}</p>
          </div>
          <div class="col-1 text-end">
            <button
              v-if="canDeleteComment(comment)"
              class="btn btn-danger btn-sm"
              @click="confirmDeleteComment(comment.id)"
            >
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>
    <div v-else class="text-muted mt-3">No comments yet. Be the first to comment!</div>

    <nav v-if="totalPages > 1" class="mt-3">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            &laquo;
          </button>
        </li>
        <li
          v-for="page in generatePagination()"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page, disabled: page === '...' }"
        >
          <button
            class="page-link"
            @click="changePage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  </div>

  <div v-if="showModal" class="modal fade show" style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Delete</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this comment?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="deleteComment">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.modal {
  z-index: 1050;
}

.text-truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.text-wrap {
  word-wrap: break-word;
  white-space: normal;
}
</style>
