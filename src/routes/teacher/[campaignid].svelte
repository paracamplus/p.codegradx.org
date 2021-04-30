<!--
      Page intended for teachers.
-->

<style>
</style>

<Page title="Enseignant {personTitle} {campaignTitle}"
      shortTitle="Enseignant" >

  {#if $campaign}
  <p class='smallHint'>L'univers 
    <span class='campaignName'>{$campaign.name}</span> est
    {#if $campaign.active}
      <span>en cours depuis le
        {CodeGradX.Date2str($campaign.starttime).replace(/ .*$/, '')}
        et jusqu'au
        {CodeGradX.Date2str($campaign.endtime).replace(/ .*$/, '')}
      </span>
    {:else}inactif{/if}
  </p>
  {/if}

  <Problem bind:error={error} />
  
  {#if $campaign && $person && isTeacher($campaign, $person) }
  <h2>Listes</h2>
  <div class='w3-center'>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showStudentsCreationForm')}>
      nouveaux apprenants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showStudentsList')}>
      apprenants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showTeachersList')}>
      enseignants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showExercisesList')}>
      exercices</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showExercisesSet')}>
      jeu d'exercices</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showBatches')}>
      lots</button>
  </div>

  {#if widgets.showStudentsCreationForm}
    <StudentsCreation on:close={closeAll} />
  {:else if widgets.showStudentsList}
    <StudentsList on:close={closeAll} />
  {:else if widgets.showTeachersList}
    <TeachersList on:close={closeAll} />
  {:else if widgets.showExercisesList}
    <AllExercicesList on:close={closeAll} />
  {:else if widgets.showExercisesSet}
    <ExercisesSetCreation on:close={closeAll} />
  {:else if widgets.showBatches}
    <BatchesList on:close={closeAll} />
  {/if}

  <h2>Statistiques</h2>
  <div class='w3-center'>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showStudentsStats')}>
      par apprenants</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showExercisesStats')}>
      par exercice</button>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showDaysStats')}>
      par jour</button>
  </div>

  {#if widgets.showStudentsStats}
  <StudentsStats on:close={closeAll} />
  {:else if widgets.showExercisesStats}
  <ExercisesStats on:close={closeAll} />
  {:else if widgets.showDaysStats}
  <DaysStats on:close={closeAll} />
  {/if}

  <h2>Notifications</h2>
  <div class='w3-center'>
    <button class='w3-btn w3-round-xxlarge w3-theme-l4'
            on:click={mkCloseAllBut('showNotifications')}>
      dernières notifications</button>
  </div>

  {#if widgets.showNotifications}
  <Notifications on:close={closeAll} />
  {/if}

  {:else if ! error}
  <div>
    <WaitingImage message="Chargement des données de l'univers..." />
  </div>
  {/if}
  
</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import FileChooser from '../../components/FileChooser.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import StudentsList from '../../components/StudentsList.svelte';
 import StudentsCreation from '../../components/StudentsCreation.svelte';
 import TeachersList from '../../components/TeachersList.svelte';
 import AllExercicesList from '../../components/AllExercisesList.svelte';
 import BatchesList from '../../components/BatchesList.svelte';
 import StudentsStats from '../../components/StudentsStats.svelte';
 import ExercisesStats from '../../components/ExercisesStats.svelte';
 import DaysStats from '../../components/DaysStats.svelte';
 import Notifications from '../../components/Notifications.svelte';
 import ExercisesSetCreation from '../../components/ExercisesSetCreation.svelte';

 import { onMount } from 'svelte';
 import { person, campaign, lastmessage } from '../../stores.mjs';
 import { initializePerson, isTeacher, goto, isUser }
   from '../../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/src/newexercise';
 import { CodeGradX as _ } from 'codegradx/src/userlib';
 import { fetchCampaign } from '../../client/campaignlib.mjs';
 import { sleep, onClient } from '../../common/utils.mjs';
 import { parseAnomaly } from '../../client/errorlib.mjs';
 import queryString from 'query-string';

 let error = undefined;
 let personTitle = "";
 let campaignTitle = '';

 let widgets = {
   showStudentsList: false,
   showStudentsCreationForm: false,
   showExercisesSet: false,
   showTeachersList: false,
   showExercisesList: false,
   showStudentsStats: false,
   showExercisesStats: false,
   showBatches: false,
   showDaysStats: false,
   showNotifications: false
 };

 function closeAll (event) {
   Object.keys(widgets).forEach(key => {
     widgets[key] = false;
   });
 }
   
 function mkCloseAllBut (widget) {
   return function (event) {
     const old = widgets[widget];
     closeAll();
     widgets[widget] = ! old;
     if ( widgets[widget] ) {
       const url = window.location.href.replace(/[?].*$/, '');
       window.history.replaceState(null, '', `${url}?open=${widget}`);
     }
   };
 }

 onClient(async () => {
   const maybeperson = await initializePerson();
   if ( ! isUser(maybeperson) ) {
     $lastmessage = error = "Désolé, j'ignore qui vous êtes!";
     goto('/connect');
     return;
   } else {
     $person = maybeperson;
   }
   //console.log($person);
   personTitle = $person.pseudo;
 });

 onMount(async () => {
   const uri = window.document.location.pathname;
   const campaignName = uri.replace(/^(.*\/)?teacher\/([^\/]+)/, '$2');
   $person = await initializePerson();
   if (  ! isUser($person) ) {
     $lastmessage = error = "Désolé, j'ignore qui vous êtes!";
     goto('/connect');
     return;
   }
   $campaign = await fetchCampaign($person, campaignName);
   if ( ! $campaign ) {
     $lastmessage = error = "Je ne vois pas d'univers ainsi nommé!";
     goto('/universes');
     return;
   }
   //console.log($campaign);
   campaignTitle = `de ${$campaign.name}`;
   if ( ! isTeacher($campaign, $person) ) {
     error = "Vous n'êtes pas un enseignant de cet univers!";
     return;
   }
   const params = queryString.parse(window.document.location.search);
   if ( 'open' in params && params.open in widgets ) {
     mkCloseAllBut(params.open)();
   }     
 });

</script>
