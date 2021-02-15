{#if exercise && exercise.stem }
  <div class='w3-container'>
  <h3>Énoncé</h3>
  <div>{@html exercise.stem}</div>
</div>
{/if}

<script>
 export let exercise = undefined;
</script>
