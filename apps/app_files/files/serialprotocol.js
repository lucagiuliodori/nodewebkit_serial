var serialPort=require("serialport");
var portsList;
var prevPortsList;
var serialPortOpened;
var serialPortOpenedScan;
var indexScanPort;
var isScanningPorts;

var startScanTimeout;

var serialSources;
var newSerialSources
var indexSerialSources;

var clbFncPortOpen;
var clbFncPortClose;
var clbFncDataRec;

function initSerial()
{
	serialSources=[];
	startScanPorts();
	clbFncPortOpen=null;
	clbFncPortClose=null;
	clbFncDataRec=null;
}

function openPort(comName,fncPortOpen,fncDataRec)
{
	//Apre la porta seriale.
	if(comName)
	{
		if(serialPortOpened)
		{
			if(serialPortOpened.path==comName)
			{
				readDataFromSerialPort();
				return;
			}
			else
				closePort(null);
		}
		clbFncPortOpen=fncPortOpen;
		clbFncDataRec=fncDataRec;
		serialPortOpened=new serialPort.SerialPort(comName,{baudrate:9600,dataBits:8,stopBits:1,parity:'none'},false,clbScanSerial);
		serialPortOpened.open(evPortIsOpen);
	}
}

function closePort(fncPortClose)
{
	if(serialPortOpened)
	{
		serialPortOpened.close(evPortIsClose);
		clbFncPortClose=fncPortClose;
	}
}

function clbScanSerial(err)
{
	//Chiude la porta.
	if(err.message=='Disconnected')
		closePort(null);
}

function evPortIsOpen(error)
{
	if(error)
		console.log('ERROR OPENING PORT: '+error);
	else
	{
		console.log('Port opened');
		//Setta l'evento di dati ricevuti e dati inviati.
		serialPortOpened.on('data',dataRec);
		//Segnala che la porta è stata aperta.
		if(clbFncPortOpen)
			clbFncPortOpen();
	}	
}

function evPortIsClose(error)
{
	if(error)
		console.log('ERROR CLOSING PORT: port already close.');
	else
	{
		console.log('Port closed.');
		serialPortOpened=null;
		//Segnala che la porta è stata chiusa.
		if(clbFncPortClose)
			clbFncPortClose();
	}
}

function dataRec(data)
{
	clbFncDataRec(data);
}

function dataSent(err,results)
{
}

function sendData(data)
{
	//Invia i dati.
	if(serialPortOpened)
		serialPortOpened.write(data,dataSent);
}



function closePortScan()
{
	if(serialPortOpenedScan)
	{
		serialPortOpenedScan.close
		(
			function(error)
			{
				if(error)
					console.log('ERROR CLOSING SCAN PORT: scan port already closed.');
				else
					console.log('Scan port closed.');
			}
		);
	}
	serialPortOpenedScan=null;
}

function startScanPorts()
{
	if(!(isScanningPorts))
	{
		clearTimeout(startScanTimeout);
		isScanningPorts=true;
		serialPort.list(evPortList);
	}
}

function evPortList(err, ports)
{
	if(err)
		consol("Error open ports: "+err);
	else
		checkChangePortsList(ports);
}

function checkChangePortsList(ports)
{
	var newPortsList;
	//var isChanged;
	var i;
	
	//Controlla se porte seriali disponibili sono cambiate.
	newPortsList=[];
	for(i=0;i<ports.length;i++)
		newPortsList[i]=ports[i];
	ports.forEach
	(
		function(port)
		{
			console.log('\r\n'+port.comName+' - '+port.pnpId+' - '+port.manufacturer);
		}
	);
	
	/* //Controlla se le due liste sono uguali.
	isChanged=false;
	if(prevPortsList)
	{
		if(prevPortsList.length!=newPortsList.length)
			isChanged=true;
		else
		{
			for(i=0;i<newPortsList.length;i++)
			{
				if(prevPortsList[i].comName!=newPortsList[i].comName || prevPortsList[i].pnpId!=newPortsList[i].pnpId || prevPortsList[i].manufacturer!=newPortsList[i].manufacturer)
				{
					isChanged=true;
					break;
				}
			}
		}
	}
	else
		isChanged=true;
	if(isChanged)
	{ */
		//Salva la lista di porte e crea la lista per la scansione.
		prevPortsList=[];
		for(i=0;i<newPortsList.length;i++)
			prevPortsList[i]=newPortsList[i];
		portsList=[];
		for(i=0;i<newPortsList.length;i++)
		{
			if(newPortsList[i].comName!="" && newPortsList[i].pnpId!="" && newPortsList[i].manufacturer!="")
				portsList[i]=newPortsList[i];
		}
		//Inizializza le varibili.
		indexScanPort=0;
		indexSerialSources=0;
		newSerialSources=[];
		//Interroga le porte seriali.
		scanPorts();
	/* }
	else
	{
		//Cancella il flag.
		isScanningPorts=false;
		//Chiama la funzione.
		scanSourcesEnd(false);
	} */
}

function scanPorts()
{
	var i,listIsChanged;
	
	//Controlla se la porta da controllare è quella già aperta. In caso di esito positivo salta alla porta successiva.
	if(serialPortOpened && portsList.length>indexScanPort)
	{
		if(portsList[indexScanPort].comName==serialPortOpened.path)
		{
			//Aggiunge la porta attualmente aperta alla lista.
			newSerialSources[indexSerialSources++]=
			{
				name:serialPortOpened.path,
				comName:serialPortOpened.path,
			};
			//Incrementa l'indice.
			indexScanPort++;
		}
	}
	
	if(portsList.length>indexScanPort)
	{
		//Apre la porta seriale.
		serialPortOpenedScan=new serialPort.SerialPort(portsList[indexScanPort++].comName.toString(),{baudrate:9600,dataBits:8,stopBits:1,parity:'none'},false,clbScanSerialPort);
		serialPortOpenedScan.open(evPortIsOpenScan);
	}
	else
	{
		//Controlla se la nuova lista è cambiata.
		listIsChanged=false;
		if(newSerialSources)
		{
			if(serialSources)
			{
				if(serialSources.length!=newSerialSources.length)
					listIsChanged=true;
				else
				{
					for(i=0;i<serialSources;i++)
					{
						if(serialSources[i].name!=newSerialSources[i].name || serialSources[i].comName!=newSerialSources[i].comName)
							listIsChanged=true;
					}
				}
			}
			else
				listIsChanged=true;
			
			//Salva la nuova lista di dispositivi.
			serialSources=[];
			for(i=0;i<newSerialSources.length;i++)
			{
				serialSources[i]=
				{
					name:newSerialSources[i].name,
					comName:newSerialSources[i].comName
				};
			}
		}
		//Cancella il flag.
		isScanningPorts=false;
		//Avvia il timeout per il riavvio della scansione.
		startScanTimeout=setTimeout(startScanPorts,10000)
		if(listIsChanged)
			fillSerialPortsList(serialSources);
	}
}

function clbScanSerialPort(err)
{
	//Chiude la porta.
	if(err.message=='Disconnected')
	{
		//Chiude la porta.
		closePortScan();
		//Interroga la porta successiva.
		scanPorts();
	}
}

function evPortIsOpenScan(error)
{
	var pkt=[];
	var i;
	var crc16;
	
	if(error)
	{
		console.log('ERROR OPENING SCAN PORT: '+error);
		//Scansiona la porta successiva.
		scanPorts();
	}
	else
	{
		console.log('Scan port opened.');
		//Aggiunge la porta alla lista.
		newSerialSources[indexSerialSources++]=
		{
			name:serialPortOpenedScan.path,
			comName:serialPortOpenedScan.path,
		};
		//Chiude la porta.
		closePortScan();
		//Interroga la porta successiva.
		scanPorts();
	}
}
