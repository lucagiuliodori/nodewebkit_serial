var path=require('path');
var fs=require('fs');
var gui=require('nw.gui');
var shell;
var win;
var confToClose;
var serialPorts;

//******************************
//Init
//******************************
function init()
{
	//Inizializza gli oggetti win e shell.
	win=gui.Window.get();
	shell=gui.Shell;
	//Inizializza gli eventi della finestra.
	win.on('close',checkContentToCloseWin);
	win.on('closed',closedWin);
	//Massimizza la finestra.
	win.maximize();
	//Setta la finestra in primo piano (la setta e la toglie dallo stato di "sempre in primo piano").
	win.setAlwaysOnTop(true);
	win.setAlwaysOnTop(false);
	win.focus();
	//Inizializza le variabili.
	confToClose=true;
	//Inizializza i diversi blocchi.
	initSerial();
}

function fillSerialPortsList(serialPortsList)
{
	var i;
	var selectHtml,optionHtml;
	
	serialPorts=serialPortsList;
	//Cancella gli option della select.
	selectHtml=document.getElementById("serialPortsList");
	while(selectHtml.firstChild)
		selectHtml.removeChild(selectHtml.firstChild);
	//Popola la select.
	for(i=0;i<serialPorts.length;i++)
	{
		optionHtml=document.createElement("option");
		optionHtml.value=serialPorts[i].comName;
		optionHtml.text=serialPorts[i].name;
		selectHtml.appendChild(optionHtml);
	}
}

function refreshPortsList()
{
	startScanPorts();
}

function conDisSelectedPort()
{
	var selectHtml;
	
	if(serialPortOpened)
		closePort(portClosed);		//Chiude la porta.
	else
	{
		selectHtml=document.getElementById("serialPortsList");
		openPort(selectHtml.options[selectHtml.selectedIndex].value,portOpened,dataRec);		//Apre la porta.
	}
}

function portOpened()
{
	//Disabilita select e pulsante di refresh.
	document.getElementById("serialPortsList").disabled=true;
	document.getElementById("bttRefresh").disabled=true;
	//Abilita i testi.
	document.getElementById("textTx").disabled=false;
	document.getElementById("textRx").disabled=false;
	//Cambia il testo al pulsante di connessione.
	document.getElementById("bttConnect").value="Disconnect";
}

function portClosed()
{
	//Abilita select e pulsante di refresh.
	document.getElementById("serialPortsList").disabled=false;
	document.getElementById("bttRefresh").disabled=false;
	//Disabilita i testi.
	document.getElementById("textTx").disabled=true;
	document.getElementById("textRx").disabled=true;
	//Cambia il testo al pulsante di connessione.
	document.getElementById("bttConnect").value="Connect";
}

function dataRec(data)
{
	document.getElementById("textRx").value+=data.toString();
}

function textTxKeyPress(evt)
{
    var charCode,charStr;
	
	evt=evt||window.event;
    charCode=evt.keyCode||evt.which;
    charStr=String.fromCharCode(charCode);
	sendData(charStr);
}

function clearDataTx()
{
	document.getElementById("textTx").value="";
}

function clearDataRx()
{
	document.getElementById("textRx").value="";
}

function closedWin()
{
	
}

function checkContentToCloseWin()
{
	var res;
	
	res=confirm('Sicuri di voler chiudere il programma?',"ATTENZIONE!")
	if(res)
	{
		//Chiude la porta seriale aperta.
		closePort(null);
		//Chiude la porta aperta per l'esecuzione della scansione delle sorgenti.
		closePortScan();
		//Chiude la app.
		gui.App.quit();
	}
}

//******************************

