<style>
 a.separator {
   margin-right: 1em;
 }
</style>

{#if exercise && exercise.equipment && exercise.equipment.length > 0 }
  <div class='w3-container'>
  <h3>Fichiers d'accompagnement</h3>
  {#each exercise.equipment as equipment}
  <a class='w3-btn w3-round-xlarge w3-theme-l4 separator'
     href={computeURL(equipment)}
     _target='_blank' >{equipment.replace(/^\//, '')}</a>
  {/each}
</div>
{/if}

<script>
 export let exercise = undefined;

 function computeURL (equipment) {
   const url = `${exercise.server}/exercisecontent/${exercise.safecookie}` +
               `/path${equipment}`;
  return url;
 }
</script>
