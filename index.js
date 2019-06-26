
// Define classes storing Transaction and Accounts

class Transaction
{
    constructor(TrDate, From, To, Narrative, Amount)
    {
        this.TrDate = TrDate;
        this.From = From;
        this.To = To;
        this.Narrative = Narrative;
        this.Amount = Amount;
        // this.Processed = false;
    }
}

class Account
{
    constructor(name)
    {
        this.name = name;
        this.Balance = 0;
        this.Transaction = [];
        this.updatedBalance = false;
        this.updatedTransaction = false;
    }
    CalculateBalance(WholeTransactionList)
    {
        var money = 0;
        for(let i=0;i<WholeTransactionList.length;i++)
        {
            if(WholeTransactionList[i].From == this.name)
            {
                money = money - WholeTransactionList[i].Amount;
            }
            if(WholeTransactionList[i].To == this.name)
            {
                money = money + WholeTransactionList[i].Amount;
            }
        }
        this.updatedBalance = true;
        this.Balance = money;
        return;
    }
    PrintBalance(WholeTransactionList)
    {
        if(!this.updatedBalance) this.CalculateBalance(WholeTransactionList);
        return this.Balance;
    }
    UpdateTransaction(WholeTransactionList)
    {
        var ListTransaction = [];
        for(let i=0;i<WholeTransactionList.length;i++)
        {
            if(WholeTransactionList[i].From == this.name || WholeTransactionList[i].To == this.name)
            {
                ListTransaction.push(WholeTransactionList[i]);
            }
        }
        this.Transaction = ListTransaction;
        return;
    }
    PrintTransaction(WholeTransactionList)
    {
        if(!this.updatedTransaction) this.UpdateTransaction(WholeTransactionList);
        return this.Transaction;
    }
}

ImportModules();
GetPath();
CreateStorage();
CreateLog();
ReadFileData();
CreateAccounts();

console.log('Welcome to SupportBank');

// Take input from the user and gives relevant output

while(true)
{
    console.log("Type List All for balance of everyone, List [Name] for one's balance and list of transactions, Import File [Filename] to Import the transaction data and anything else to exit");
    var tmp = readlineSync.question('Now give an input: ');
    if(tmp.slice(0,7) == 'Import ')
    {
        curname = tmp.slice(7);
        ReadTransactionFile(curname,FindType(curname));
        continue;
    }
    if(tmp.length<5 || tmp.slice(0,5) != 'List ')
    {
        break;
    }
    curname = tmp.slice(5);
    if(curname == 'All')
    {
        for(let i=0;i<Accounts.length;i++)
        {
            console.log(Accounts[i].name + ' has ' + Accounts[i].PrintBalance(TransactionData).toFixed(2));
        }
    }
    else
    {
        Foundname = false;
        for(let i=0;i<Accounts.length;i++)
        {
            if(Accounts[i].name == curname)
            {
                console.log(Accounts[i].PrintTransaction(TransactionData));
                Foundname = true;
            }
        }
        if(!Foundname) console.log('Name Not Found');
    }
}

function CheckValidityTransaction(TransactionCandidate,CheckLength,CheckDate,CheckAmount)
{
    if(CheckLength && TransactionCandidate.length != 5)
    {
        return 'Length';
    }
    if(CheckDate && !moment(TransactionCandidate[0],'DD-MM-YYYY').isValid())
    {
        return 'Date';
    }
    if(CheckAmount && isNaN(TransactionCandidate[4]))
    {
        return 'Money';
    }
    return true;
}

// Import Modules

function ImportModules()
{
    fs = require('fs');
    path = require('path');
    moment = require('moment');
    readlineSync = require('readline-sync');
    convert = require('xml-js');
    log4js = require('log4js');
}

// Defines Path of files

function GetPath()
{
    Data2014 = 'Transactions2014.csv';
    Data2015 = 'DodgyTransactions2015.csv';
    Data2013 = 'Transactions2013.json';
    Data2012 = 'Transactions2012.xml';
    Path2012 = path.join(__dirname,'./Transactions2012.xml');
}

// Define places to store transaction data and accounts

function CreateStorage()
{
    TransactionData = [];
    Accounts = [];
    NameLog = [];
}

// Set log file

function CreateLog()
{
    log4js.configure({
        appenders: {
            file: { type: 'fileSync', filename: 'logs/debug.log' }
        },
        categories: {
            default: { appenders: ['file'], level: 'info'}
        }
    });
}

// Read Transaction Data

function ReadFileData()
{
    ReadTransactionFile(Data2014,'csv');
    ReadTransactionFile(Data2015,'csv');
    ReadTransactionFile(Data2013,'json');
    ReadTransactionFile(Data2012,'xml')
}

// Extracts all accounts from transactions

function CreateAccounts()
{
    for(let i = 0; i < TransactionData.length; i++)
    {
        if(!NameLog.includes(TransactionData[i].From))
        {
            Accounts.push(new Account(TransactionData[i].From));
            NameLog.push(TransactionData[i].From);
        }
        if(!NameLog.includes(TransactionData[i].To))
        {
            Accounts.push(new Account(TransactionData[i].To));
            NameLog.push(TransactionData[i].To);
        }
    }
}

// Read the file data from given file and type

function ReadTransactionFile(FileName,Type)
{
    FilePath = path.join(__dirname,'./',FileName);
    switch(Type)
    {
        case 'csv':
            var logger = log4js.getLogger(FileName);
            logger.info('Starts reading from '+ FileName);
            var RawInputFile = fs.readFileSync(FilePath, {encoding: 'utf-8'}).split("\n");

            for(i=1;i<RawInputFile.length;i++)
            {
                let tmp = RawInputFile[i].split(',');
                switch(CheckValidityTransaction(tmp,true,true,true))
                {
                    case 'Length':
                    {
                        logger.error(`Line ${i+1} has invalid format`);
                        console.log(`Line ${i+1} of ${FileName} is not processed. See Log for details`);
                        continue;
                    }
                    case 'Date':
                    {
                        logger.error(`Line ${i+1} has invalid date`);
                        console.log(`Line ${i+1} of ${FileName} is not processed. See Log for details`);
                        continue;
                    }
                    case 'Money':
                    {
                        logger.error(`Line ${i+1} has invalid amount of money`);
                        console.log(`Line ${i+1} of ${FileName} is not processed. See Log for details`);
                        continue;
                    }
                }
                TransactionData .push(new Transaction(moment(tmp[0],'DD-MM-YYYY'),tmp[1],tmp[2],tmp[3],Number(tmp[4])));
            }
            break;
        case 'json':
            logger = log4js.getLogger(FileName);
            logger.info('Starts reading from '+ FileName);
            var RawInputFile = JSON.parse(fs.readFileSync(FilePath, {encoding: 'utf-8'}));

            for(i=1;i<RawInputFile.length;i++)
            {
                tmp = [RawInputFile[i].Date,0,0,0,RawInputFile[i].Amount]
                switch(CheckValidityTransaction(tmp,false,true,true))
                {
                    case 'Date':
                    {
                        logger.error(`Line ${i+1} has invalid date`);
                        console.log(`Line ${i+1} of ${FileName} is not processed. See Log for details`);
                        continue;
                    }
                    case 'Money':
                    {
                        logger.error(`Line ${i+1} has invalid amount of money`);
                        console.log(`Line ${i+1} of ${FileName} is not processed. See Log for details`);
                        continue;
                    }
                }
                TransactionData.push(new Transaction(moment(RawInputFile[i].Date,'YYYY-MM-DD'),
                RawInputFile[i].FromAccount,RawInputFile[i].ToAccount,RawInputFile[i].Narrative,Number(RawInputFile[i].Amount)));
            }
            break;
        case 'xml':
            logger = log4js.getLogger(FileName);
            logger.info('Starts reading from '+ FileName);
            var RawInputFile = JSON.parse(convert.xml2json(fs.readFileSync(FilePath, {encoding: 'utf-8'}),{compact: true, spaces: 4})).TransactionList.SupportTransaction;
            for(i=0;i<RawInputFile.length;i++)
            {
                if(isNaN(RawInputFile[i].Value._text))
                {
                    logger.error(`Line ${i+1} has invalid amount of money`);
                    console.log(`Line ${i+1} of ${FileName} is not processed. See Log for details`);
                    continue;
                }
                TransactionData.push(new Transaction(moment('1900-01-01','YYYY-MM-DD').add(RawInputFile[i]._attributes.Date,'day'),
                RawInputFile[i].Parties.From._text,RawInputFile[i].Parties.To._text,RawInputFile[i].Description._text,Number(RawInputFile[i].Value._text)));
            }
            break;
    }
    CreateAccounts();
    ResetAccount();
}

// Resets the account so that it gets calculated later

function ResetAccount()
{    
    for( i = 0; i < Accounts.length; i++)
    {
        Accounts[i].updatedBalance = false;
        Accounts[i].updatedTransaction = false;
    }
}

// Finds type of given file

function FindType(File)
{
    FileType = '';
    for(let i=File.length-1;i>=0;i--)
    {
        if(File[i]=='.')
        {
            return FileType;
        }
        FileType = File[i] + FileType;
    }
    return FileType;
}