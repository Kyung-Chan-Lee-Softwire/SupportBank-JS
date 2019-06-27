const { Account } = require("./Account");
const { Transaction } = require("./Transaction");
const paths = GetPath();
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const readlineSync = require('readline-sync');
const convert = require('xml-js');
const log4js = require('log4js');

readlineSync.question('Press any key to continue');
console.log('Welcome to SupportBank');

main()

function CheckValidityTransaction(TransactionCandidate, CheckLength, CheckDate, CheckAmount) {
    if (CheckLength && TransactionCandidate.length != 5) {
        return 'Length';
    }
    if (CheckDate && !moment(TransactionCandidate[0], 'DD-MM-YYYY').isValid()) {
        return 'Date';
    }
    if (CheckAmount && isNaN(TransactionCandidate[4])) {
        return 'Money';
    }
    return true;
}

// Defines Path of files

function GetPath() {
    return {
    Data2014: 'Transactions2014.csv',
    Data2015: 'DodgyTransactions2015.csv',
    Data2013: 'Transactions2013.json',
    Data2012: 'Transactions2012.xml',
    }
}
// Define places to store transaction data and accounts

function CreateStorage() {
    TransactionData = [];
    Accounts = [];
    NameLog = [];
}

// Set log file

function CreateLog() {
    log4js.configure({
        appenders: {
            file: { type: 'fileSync', filename: 'logs/debug.log' }
        },
        categories: {
            default: { appenders: ['file'], level: 'info' }
        }
    });
}

// Read Transaction Data

function ReadFileData() {
    ReadTransactionFile(paths.Data2014, 'csv');
    ReadTransactionFile(paths.Data2015, 'csv');
    ReadTransactionFile(paths.Data2013, 'json');
    ReadTransactionFile(paths.Data2012, 'xml')
}

// Extracts all accounts from transactions

function CreateAccounts() {
    for (let i = 0; i < TransactionData.length; i++) {
        if (!NameLog.includes(TransactionData[i].From)) {
            Accounts.push(new Account(TransactionData[i].From));
            NameLog.push(TransactionData[i].From);
        }
        if (!NameLog.includes(TransactionData[i].To)) {
            Accounts.push(new Account(TransactionData[i].To));
            NameLog.push(TransactionData[i].To);
        }
    }
}

// Read the file data from given file and type

function ReadTransactionFile(FileName, Type) {
    FilePath = path.join(__dirname, './', FileName);
    switch (Type) {
        case 'csv':
            var logger = log4js.getLogger(FileName);
            logger.info('Starts reading from ' + FileName);
            var RawInputFile = fs.readFileSync(FilePath, { encoding: 'utf-8' }).split("\n");

            for (i = 1; i < RawInputFile.length; i++) {
                let tmp = RawInputFile[i].split(',');
                switch (CheckValidityTransaction(tmp, true, true, true)) {
                    case 'Length':
                        {
                            logger.error(`Line ${i + 1} has invalid format`);
                            console.log(`Line ${i + 1} of ${FileName} is not processed. See Log for details`);
                            continue;
                        }
                    case 'Date':
                        {
                            logger.error(`Line ${i + 1} has invalid date`);
                            console.log(`Line ${i + 1} of ${FileName} is not processed. See Log for details`);
                            continue;
                        }
                    case 'Money':
                        {
                            logger.error(`Line ${i + 1} has invalid amount of money`);
                            console.log(`Line ${i + 1} of ${FileName} is not processed. See Log for details`);
                            continue;
                        }
                }
                TransactionData.push(new Transaction(moment(tmp[0], 'DD-MM-YYYY'), tmp[1], tmp[2], tmp[3], Number(tmp[4])));
            }
            break;
        case 'json':
            logger = log4js.getLogger(FileName);
            logger.info('Starts reading from ' + FileName);
            var RawInputFile = JSON.parse(fs.readFileSync(FilePath, { encoding: 'utf-8' }));

            for (i = 1; i < RawInputFile.length; i++) {
                tmp = [RawInputFile[i].Date, 0, 0, 0, RawInputFile[i].Amount]
                switch (CheckValidityTransaction(tmp, false, true, true)) {
                    case 'Date':
                        {
                            logger.error(`Line ${i + 1} has invalid date`);
                            console.log(`Line ${i + 1} of ${FileName} is not processed. See Log for details`);
                            continue;
                        }
                    case 'Money':
                        {
                            logger.error(`Line ${i + 1} has invalid amount of money`);
                            console.log(`Line ${i + 1} of ${FileName} is not processed. See Log for details`);
                            continue;
                        }
                }
                TransactionData.push(new Transaction(moment(RawInputFile[i].Date, 'YYYY-MM-DD'),
                    RawInputFile[i].FromAccount, RawInputFile[i].ToAccount, RawInputFile[i].Narrative, Number(RawInputFile[i].Amount)));
            }
            break;
        case 'xml':
            logger = log4js.getLogger(FileName);
            logger.info('Starts reading from ' + FileName);
            var RawInputFile = JSON.parse(convert.xml2json(fs.readFileSync(FilePath, { encoding: 'utf-8' }), { compact: true, spaces: 4 })).TransactionList.SupportTransaction;
            for (i = 0; i < RawInputFile.length; i++) {
                if (isNaN(RawInputFile[i].Value._text)) {
                    logger.error(`Line ${i + 1} has invalid amount of money`);
                    console.log(`Line ${i + 1} of ${FileName} is not processed. See Log for details`);
                    continue;
                }
                TransactionData.push(new Transaction(moment('1900-01-01', 'YYYY-MM-DD').add(RawInputFile[i]._attributes.Date, 'day'),
                    RawInputFile[i].Parties.From._text, RawInputFile[i].Parties.To._text, RawInputFile[i].Description._text, Number(RawInputFile[i].Value._text)));
            }
            break;
    }
    CreateAccounts();
    ResetAccount();
}

// Read the file data from given file as CSV

function WriteTransactionFile(FileName) {
    FilePath = path.join(__dirname, './', FileName);
    var PrintableData = 'Date,From,To,Narrative,Amount';
    for (i = 0; i < TransactionData.length; i++) {
        PrintableData = PrintableData +
            `\n${TransactionData[i].TrDate.format('DD-MM-YYYY')},${TransactionData[i].From},${TransactionData[i].To},${TransactionData[i].Narrative},${TransactionData[i].Amount}`;
    }
    fs.writeFileSync(FilePath, PrintableData);
}

// Resets the account so that it gets calculated later

function ResetAccount() {
    Accounts.forEach( account => {
        account.updatedBalance = false;
        account.updatedTransaction = false;
    });
}

// Finds type of given file

function FindType(File) {
    FileType = '';
    for (let i = File.length - 1; i >= 0; i--) {
        if (File[i] === '.') {
            return FileType;
        }
        FileType = File[i] + FileType;
    }
    return FileType;
}

// Take input from the user and gives relevant output

function GetUserInput(){
    while (true) {
        console.log("Type List All for balance of everyone, List [Name] for one's balance and list of transactions \
Import [Filename] to Import the transaction data, Export [Filename] to Export the transaction data as CSV and anything else to exit");
        var UserInput = readlineSync.question('Now give an input: ');
        if (UserInput.slice(0, 7) == 'Import ') {
            curname = UserInput.slice(7);
            ReadTransactionFile(curname, FindType(curname));
            continue;
        }
        if (UserInput.slice(0, 7) == 'Export ') {
            curname = UserInput.slice(7);
            WriteTransactionFile(curname);
            continue;
        }
        if (UserInput.length < 5 || UserInput.slice(0, 5) != 'List ') {
            break;
        }
        curname = UserInput.slice(5);
        if (curname == 'All') {
            for (let i = 0; i < Accounts.length; i++) {
                console.log(Accounts[i].name + ' has ' + Accounts[i].PrintBalance(TransactionData).toFixed(2));
            }
        }
        else {
            Foundname = false;
            for (let i = 0; i < Accounts.length; i++) {
                if (Accounts[i].name == curname) {
                    console.log(Accounts[i].PrintTransaction(TransactionData));
                    Foundname = true;
                }
            }
            if (!Foundname) console.log('Name Not Found');
        }
    }
}

function main(){
    CreateStorage();
    CreateLog();
    ReadFileData();
    CreateAccounts();
    GetUserInput();
}

