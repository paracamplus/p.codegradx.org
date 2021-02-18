<style>
 header.padding {
   padding: 0px 1em 0px 1em;
 }
</style>

<section class='w3-container w3-center w3-modal'
         style='display:block' >
  <div class='w3-modal-content w3-animate-top w3-border'>
    <header class='w3-xlarge w3-theme-l4 padding'>
      <span> Exercice {exercise.nickname} </span>
      <span class='w3-right w3-margin-left'
            on:click={close}>&#x2716;</span>
    </header>
    <div class='w3-container w3-margin w3-left-align'>
      <ul class='w3-ul'>
        <li> Identifiant: <b>{exercise.name}</b> </li>
        {#if exercise.uuid}
        <li> UUID: <b>{exercise.uuid}</b> </li>
        {/if}
        {#if exercise.authorship}
        <li> Créé par 
          {#each exercise.authorship as author}
             <a href='mailto:{author.email}' class='separator'>
               {author.firstname} {author.lastname}</a>
          {/each}</li>
        {/if}
        {#if exercise.tags}
        <li> Étiquettes: {#each exercise.tags as tag}
             <span class='w3-tag w3-theme-d4 separator'>{tag}</span>
             {/each}</li>
        {/if}
      </ul>

      <div class='w3-panel'>
        Si vous voyez un problème avec la formulation de cet énoncé ou
        si vous détectez une anomalie dans la notation, signalez-la
        s'il vous plait au premier des auteurs de cet exercice. Merci!
      </div>

    </div>
  </div>
</section>
    
<script>
 export let exercise = undefined;
 export let showinfo = false;

 function close (event) {
   showinfo = false;
 }

</script>
