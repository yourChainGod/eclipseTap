//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"syscall/js"

	"github.com/blocto/solana-go-sdk/client"
	"github.com/blocto/solana-go-sdk/common"
	"github.com/blocto/solana-go-sdk/types"
	"golang.org/x/exp/rand"
)

func (t *Clicker) addDelay() {
	if t.minDelay > 0 || t.maxDelay > 0 {
		delay := t.minDelay
		if t.maxDelay > t.minDelay {
			delay += rand.Intn(t.maxDelay - t.minDelay)
		}
		time.Sleep(time.Duration(delay) * time.Millisecond)
	}
}

type Clicker struct {
	client      *client.Client
	mainPublic  string
	userAccount types.Account
	minDelay    int
	maxDelay    int
	stopChan    chan struct{}
	running     bool
	mutex       sync.Mutex
	lastGrass   int
}

func makeInstructionData(discriminator ...int) []byte {
	buf := new(bytes.Buffer)
	for _, val := range discriminator {
		if err := binary.Write(buf, binary.LittleEndian, uint8(val)); err != nil {
			return nil
		}
	}
	return buf.Bytes()
}

func (t *Clicker) getAccountInfo() int {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	// client := client.NewClient("https://eclipse.helius-rpc.com")

	userAccount := common.PublicKeyFromString(t.mainPublic)
	userInfo, _, _ := common.FindProgramAddress(
		[][]byte{
			[]byte("user"),
			userAccount.Bytes(),
		},
		common.PublicKeyFromString("turboe9kMc3mSR8BosPkVzoHUfn5RVNzZhkrT2hdGxN"),
	)
	accountInfo, err := t.client.GetAccountInfo(ctx, userInfo.ToBase58())
	if err != nil {
		fmt.Println("getAccountInfo error:", err)
		return t.lastGrass
	}
	if len(accountInfo.Data) < 16 {
		return t.lastGrass
	}

	grass := int(binary.LittleEndian.Uint64(accountInfo.Data[8:16]))
	t.lastGrass = grass
	return t.lastGrass
}

func (t *Clicker) click() error {
	clickerAccount := t.userAccount
	userAccount := common.PublicKeyFromString(t.mainPublic)
	configAccount, _, _ := common.FindProgramAddress(
		[][]byte{[]byte("configuration")},
		common.PublicKeyFromString("turboe9kMc3mSR8BosPkVzoHUfn5RVNzZhkrT2hdGxN"),
	)

	clickerInfo, _, _ := common.FindProgramAddress(
		[][]byte{
			[]byte("clicker"),
			clickerAccount.PublicKey.Bytes(),
		},
		common.PublicKeyFromString("turboe9kMc3mSR8BosPkVzoHUfn5RVNzZhkrT2hdGxN"),
	)

	userInfo, _, _ := common.FindProgramAddress(
		[][]byte{
			[]byte("user"),
			userAccount.Bytes(),
		},
		common.PublicKeyFromString("turboe9kMc3mSR8BosPkVzoHUfn5RVNzZhkrT2hdGxN"),
	)

	data := makeInstructionData(11, 147, 179, 178, 145, 118, 45, 186, rand.Intn(256))
	if data == nil {
		return fmt.Errorf("构造指令数据失败")
	}

	instruction := types.Instruction{
		ProgramID: common.PublicKeyFromString("turboe9kMc3mSR8BosPkVzoHUfn5RVNzZhkrT2hdGxN"),
		Accounts: []types.AccountMeta{
			{PubKey: clickerInfo, IsSigner: false, IsWritable: false},
			{PubKey: userInfo, IsSigner: false, IsWritable: true},
			{PubKey: configAccount, IsSigner: false, IsWritable: false},
			{PubKey: clickerAccount.PublicKey, IsSigner: true, IsWritable: true},
			{PubKey: common.SysVarInstructionsPubkey, IsSigner: false, IsWritable: false},
		},
		Data: data,
	}

	recentBlockhash, err := t.client.GetLatestBlockhash(context.Background())
	if err != nil {
		return fmt.Errorf("获取区块哈希失败: %w", err)
	}

	tx, err := types.NewTransaction(types.NewTransactionParam{
		Message: types.NewMessage(types.NewMessageParam{
			FeePayer:        clickerAccount.PublicKey,
			RecentBlockhash: recentBlockhash.Blockhash,
			Instructions:    []types.Instruction{instruction},
		}),
		Signers: []types.Account{clickerAccount},
	})
	if err != nil {
		return fmt.Errorf("构造交易失败: %w", err)
	}

	_, err = t.client.SendTransaction(context.Background(), tx)
	if err != nil {
		if strings.Contains(err.Error(), "InsufficientFundsForRent") {
			return fmt.Errorf("点击次数不足")
		}
		return fmt.Errorf("发送交易失败: %w", err)
	}

	return nil
}

func parsePrivateKey(keyStr string) ([]byte, error) {
	rawString := strings.Trim(keyStr, "[]")
	numberStrings := strings.Split(rawString, ",")
	var byteArray []byte
	for _, numStr := range numberStrings {
		num, err := strconv.Atoi(strings.TrimSpace(numStr))
		if err != nil {
			return nil, fmt.Errorf("解析私钥失败: %w", err)
		}
		byteArray = append(byteArray, byte(num))
	}
	return byteArray, nil
}

func (t *Clicker) startTask() {
	t.running = true
	for {
		select {
		case <-t.stopChan:
			t.running = false
			return
		default:
			if !t.running {
				return
			}
			if err := t.click(); err != nil {
				time.Sleep(time.Second * 5)
				continue
			}

			t.addDelay()
		}
	}
}

// 全局任务管理器
var taskManager = make(map[string]*Clicker)

func main() {
	// 创建一个 channel 用于保持程序运行
	done := make(chan struct{})

	// 设置JavaScript全局函数
	js.Global().Set("startClickerTask", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		go func() {
			startClickerTask(js.Undefined(), args)
		}()
		return nil
	}))

	js.Global().Set("stopClickerTask", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		go func() {
			stopClickerTask(js.Undefined(), args)
		}()
		return nil
	}))

	js.Global().Set("getGrass", js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		return getGrass(js.Undefined(), args)
	}))

	// 防止程序退出
	<-done
}

func startClickerTask(_ js.Value, args []js.Value) interface{} {
	if len(args) != 5 {
		return nil
	}

	taskId := args[0].String()

	if oldClicker, exists := taskManager[taskId]; exists {
		if oldClicker.running {
			oldClicker.running = false
			close(oldClicker.stopChan)
		}
		delete(taskManager, taskId)
	}

	mainPublic := args[1].String()
	userPrivateStr := args[2].String()
	minDelay := args[3].Int()
	maxDelay := args[4].Int()

	userPrivateBytes, err := parsePrivateKey(userPrivateStr)
	if err != nil {
		return nil
	}

	userAccount, err := types.AccountFromBytes(userPrivateBytes)
	if err != nil {
		return nil
	}

	clicker := &Clicker{
		client:      client.NewClient("https://eclipse.lgns.net/"),
		mainPublic:  mainPublic,
		userAccount: userAccount,
		minDelay:    minDelay,
		maxDelay:    maxDelay,
		lastGrass:   0,
		stopChan:    make(chan struct{}),
		running:     false,
	}

	taskManager[taskId] = clicker

	// 启动任务
	go clicker.startTask()

	return nil
}

func stopClickerTask(_ js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return nil
	}

	taskId := args[0].String()
	if clicker, exists := taskManager[taskId]; exists {
		clicker.mutex.Lock()
		if clicker.running {
			clicker.running = false
			close(clicker.stopChan)
		}
		clicker.mutex.Unlock()
		delete(taskManager, taskId)
	}

	return nil
}

func getGrass(_ js.Value, args []js.Value) interface{} {
	if len(args) != 1 {
		return js.ValueOf(0)
	}

	taskId := args[0].String()
	if clicker, exists := taskManager[taskId]; exists {
		go clicker.getAccountInfo()
		return js.ValueOf(clicker.lastGrass)
	}
	return js.ValueOf(0)
}
