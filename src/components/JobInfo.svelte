<section class='w3-container w3-center w3-modal'
         style='display:block' >
  <div class='w3-modal-content w3-animate-top w3-border'>
    <header class='w3-theme-l4 w3-xlarge'>
      <span> Réponse </span>
      <span class='w3-right w3-margin-right'
            data-close="JobInfo"
            on:click={close}>&#x2716;</span>
    </header>

    <div class='w3-container w3-margin w3-left-align w3-padding-24'>
      <ul>
        <li> Identifiant: {job.jobid} </li>
        <li> archivage: {CodeGradX.Date2str(job.archived)} </li>
        <li> début de notation: {CodeGradX.Date2str(job.started)} </li>
        <li> fin de notation: {CodeGradX.Date2str(job.ended)} </li>
        <li> stockage: {CodeGradX.Date2str(job.finished)}
          {#if tgzurl}<a class='w3-btn w3-round-xlarge w3-theme-l4'
                         download
                         title='Télécharger votre réponse'
                         href={tgzurl}><DownloadSign /></a>{/if}
        </li>
      </ul>
      <p class='smallHint'>
        La réponse est dans le répertoire <code>content</code>
        du fichier <code>.tgz</code> que vous pouvez télécharger.
      </p>
    </div>
  </div>
</section>
    
<script>
 import DownloadSign from './DownloadSign.svelte';
 
 import { onMount } from 'svelte';
 import { CodeGradX } from 'codegradx/src/job';
 
 export let job = undefined;
 export let showinfo = false;
 let tgzurl = undefined;

 onMount(() => {
   if ( job ) {
     //console.log(job);// DEBUG
     tgzurl = `${job.originServer}${job.getTgzURL()}`;
   }
 });
 
 function close (event) {
   showinfo = false;
 }

</script>
