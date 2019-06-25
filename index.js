class Transaction
{
    constructor(TrDate, From, To, Narrative, Amount)
    {
        this.TrDate = TrDate;
        this.From = From;
        this.To = To;
        this.Narrative = Narrative;
        this.Amount = Amount;
    }
}

class Account
{
    constructor(name)
    {
        this.name = name;
        this.money = 0;
        this.updated = false;
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
        this.updated = true;
        this.money = money;
        return;
    }
    PrintBalance(WholeTransactionList)
    {
        if(!this.updated) this.CalculateBalance(WholeTransactionList);
        return this.money;
    }
    PrintTransaction(WholeTransactionList)
    {
        var ListTransaction = [];
        for(let i=0;i<WholeTransactionList.length;i++)
        {
            if(WholeTransactionList[i].From == this.name || WholeTransactionList[i].To == this.name)
            {
                ListTransaction.push(WholeTransactionList[i]);
            }
        }
        return ListTransaction;
    }
}

const fs = require('fs');
const path = require('path');
const filePath1 = path.join(__dirname,'./Transactions2014.csv');
const filePath2 = path.join(__dirname,'./DodgyTransactions2015.csv');
const moment = require('moment');
const readlineSync = require('readline-sync');
var TransactionData = [];
var Accounts = [];
var Save1 = fs.readFileSync(filePath1, {encoding: 'utf-8'});
var Save2 = fs.readFileSync(filePath2, {encoding: 'utf-8'});
var FileLine1 = Save1.split("\n");
var FileLine2 = Save2.split("\n");

for(i=0;i<FileLine1.length;i++)
{
    let tmp = FileLine1[i].split(',');
    if(isNaN(tmp[4])) continue;
    TransactionData .push(new Transaction(moment(tmp[0],'DD-MM-YYYY'),tmp[1],tmp[2],tmp[3],Number(tmp[4])));
}
for(i=0;i<FileLine2.length;i++)
{
    let tmp = FileLine2[i].split(',');
    if(isNaN(tmp[4])) continue;
    TransactionData .push(new Transaction(moment(tmp[0],'DD-MM-YYYY'),tmp[1],tmp[2],tmp[3],Number(tmp[4])));
}

console.log('Welcome to SupportBank');
NameLog = [];
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

while(true)
{
    console.log("Type List All for balance of everyone and List [Name] for one's balance and list of transactions and anything else to exit");
    var tmp = readlineSync.question('Now give an input: ');
    if(tmp.length<5 && tmp.slice(0,5) != 'List ')
    {
        break;
    }
    curname = tmp.slice(5);
    if(curname == 'All')
    {
        for(let i=0;i<Accounts.length;i++)
        {
            console.log(Accounts[i].name + ' has ' + Accounts[i].PrintBalance(TransactionData));
        }
    }
    else
    {
        for(let i=0;i<Accounts.length;i++)
        {
            if(Accounts[i].name == curname)
            {
                console.log(Accounts[i].PrintTransaction(TransactionData));
            }
        }
    }
}
