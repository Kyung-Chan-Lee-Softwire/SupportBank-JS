
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
        this.Processed = false;
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
        // this.updatedTransaction = false;
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

importall();
GetPath();
CreateStorage();
CreateLog();
ReadFileData();
CreateAccounts();

console.log('Welcome to SupportBank');

// Take input from the user and gives relevant output

while(true)
{
    console.log("Type List All for balance of everyone and List [Name] for one's balance and list of transactions and anything else to exit");
    var tmp = readlineSync.question('Now give an input: ');
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

function importall()
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
    Path2014 = path.join(__dirname,'./Transactions2014.csv');
    Path2015 = path.join(__dirname,'./DodgyTransactions2015.csv');
    Path2013 = path.join(__dirname,'./Transactions2013.json');
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
    // Read from Data of 2014

    var logger = log4js.getLogger(Data2014);
    logger.info('Starts reading from '+ Data2014);
    var RawInput2014 = fs.readFileSync(Path2014, {encoding: 'utf-8'}).split("\n");

    for(i=1;i<RawInput2014.length;i++)
    {
        let tmp = RawInput2014[i].split(',');
        switch(CheckValidityTransaction(tmp,true,true,true))
        {
            case 'Length':
            {
                logger.error(`Line ${i+1} has invalid format`);
                console.log(`Line ${i+1} of ${Data2014} is not processed. See Log for details`);
                continue;
            }
            case 'Date':
            {
                logger.error(`Line ${i+1} has invalid date`);
                console.log(`Line ${i+1} of ${Data2014} is not processed. See Log for details`);
                continue;
            }
            case 'Money':
            {
                logger.error(`Line ${i+1} has invalid amount of money`);
                console.log(`Line ${i+1} of ${Data2014} is not processed. See Log for details`);
                continue;
            }
        }
        TransactionData .push(new Transaction(moment(tmp[0],'DD-MM-YYYY'),tmp[1],tmp[2],tmp[3],Number(tmp[4])));
    }

    // Read from Data of 2015

    logger = log4js.getLogger(Data2015);
    logger.info('Starts reading from '+ Data2015);
    var RawInput2015 = fs.readFileSync(Path2015, {encoding: 'utf-8'}).split("\n");

    for(i=1;i<RawInput2015.length;i++)
    {
        let tmp = RawInput2015[i].split(',');
        switch(CheckValidityTransaction(tmp,true,true,true))
        {
            case 'Length':
            {
                logger.error(`Line ${i+1} has invalid format`);
                console.log(`Line ${i+1} of ${Data2015} is not processed. See Log for details`);
                continue;
            }
            case 'Date':
            {
                logger.error(`Line ${i+1} has invalid date`);
                console.log(`Line ${i+1} of ${Data2015} is not processed. See Log for details`);
                continue;
            }
            case 'Money':
            {
                logger.error(`Line ${i+1} has invalid amount of money`);
                console.log(`Line ${i+1} of ${Data2015} is not processed. See Log for details`);
                continue;
            }
        }
        TransactionData.push(new Transaction(moment(tmp[0],'DD-MM-YYYY'),tmp[1],tmp[2],tmp[3],Number(tmp[4])));
    }

    // Read from Data of 2013

    logger = log4js.getLogger(Data2013);
    logger.info('Starts reading from '+ Data2013);
    var RawInput2013 = JSON.parse(fs.readFileSync(Path2013, {encoding: 'utf-8'}));

    for(i=1;i<RawInput2013.length;i++)
    {
        tmp = [RawInput2013[i].Date,0,0,0,RawInput2013[i].Amount]
        switch(CheckValidityTransaction(tmp,false,true,true))
        {
            case 'Date':
            {
                logger.error(`Line ${i+1} has invalid date`);
                console.log(`Line ${i+1} of ${Data2013} is not processed. See Log for details`);
                continue;
            }
            case 'Money':
            {
                logger.error(`Line ${i+1} has invalid amount of money`);
                console.log(`Line ${i+1} of ${Data2013} is not processed. See Log for details`);
                continue;
            }
        }
        TransactionData.push(new Transaction(moment(RawInput2013[i].Date,'YYYY-MM-DD'),
        RawInput2013[i].FromAccount,RawInput2013[i].ToAccount,RawInput2013[i].Narrative,Number(RawInput2013[i].Amount)));
    }

    // Read from Data of 2012

    logger = log4js.getLogger(Data2012);
    logger.info('Starts reading from '+ Data2012);
    var RawInput2012 = JSON.parse(convert.xml2json(fs.readFileSync(Path2012, {encoding: 'utf-8'}),{compact: true, spaces: 4})).TransactionList.SupportTransaction;
    for(i=0;i<RawInput2012.length;i++)
    {
        if(isNaN(RawInput2012[i].Value._text))
        {
            logger.error(`Line ${i+1} has invalid amount of money`);
            console.log(`Line ${i+1} of ${Data2012} is not processed. See Log for details`);
            continue;
        }
        TransactionData.push(new Transaction(moment('1900-01-01','YYYY-MM-DD').add(RawInput2012[i]._attributes.Date,'day'),
        RawInput2012[i].Parties.From._text,RawInput2012[i].Parties.To._text,RawInput2012[i].Description._text,Number(RawInput2012[i].Value._text)));
    }
}

// Extracts all accounts from transactions

function CreateAccounts()
{
    for( i = 0; i < TransactionData.length; i++)
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